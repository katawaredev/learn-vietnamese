export interface CacheEntry {
	blobUrl: string;
	lastUsed: number;
}

export interface BaseTTSRequest {
	id: string;
	text: string;
	resolve: (audio: HTMLAudioElement) => void;
	reject: (error: Error) => void;
	onProgress?: (progress: number) => void;
}

export interface WorkerResponse {
	requestId: string;
	status: "progress" | "complete" | "error";
	progress?: number;
	audio?: Blob;
	error?: string;
}

/**
 * Abstract base class for TTS worker pools.
 *
 * Handles all shared mechanics:
 * - Lazy worker initialization
 * - Serial request queuing (one active request at a time)
 * - LRU audio cache with blob URL lifecycle management
 * - Progress forwarding
 * - Worker error recovery
 * - Cleanup on terminate
 *
 * Subclasses implement:
 * - `createWorker()` — instantiates the appropriate Web Worker
 * - `buildCacheKey(request)` — derives the Map key from the request
 * - `buildWorkerMessage(request)` — constructs the postMessage payload
 * - `generateAudio(...)` — typed public API matching the worker's specific fields
 * - `isCached(...)` — typed public async check (in-memory + optional persistent store)
 */
export abstract class BaseTTSWorkerPool<TRequest extends BaseTTSRequest> {
	protected worker: Worker | null = null;
	protected requestQueue: TRequest[] = [];
	protected activeRequest: TRequest | null = null;
	protected cache = new Map<string, CacheEntry>();
	protected readonly MAX_CACHE_SIZE = 50;
	private isInitialized = false;

	// --- Abstract interface ---

	/** Create and return the dedicated Web Worker for this pool. */
	protected abstract createWorker(): Worker;

	/**
	 * Whether to store the generated audio in the in-memory cache.
	 * Subclasses can return false for entries that are persisted elsewhere
	 * (e.g. Vietnamese voices backed by IndexedDB).
	 */
	protected shouldMemoryCache(_request: TRequest): boolean {
		return true;
	}

	/**
	 * Called after a successful inference, before the request is resolved.
	 * Subclasses can override to persist the audio blob to a durable store.
	 * The base implementation is a no-op.
	 */
	protected onAudioGenerated(
		_cacheKey: string,
		_blob: Blob,
		_request: TRequest,
	): void {}

	/** Build the cache lookup key from the request. */
	protected abstract buildCacheKey(request: TRequest): string;

	/** Construct the message payload to post to the worker. */
	protected abstract buildWorkerMessage(
		request: TRequest,
	): Record<string, unknown>;

	// --- Shared implementation ---

	protected ensureInitialized(): void {
		if (this.isInitialized && this.worker) return;

		this.worker = this.createWorker();

		this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			this.handleWorkerMessage(event.data);
		};

		this.worker.onerror = (error) => {
			console.error("[TTS Pool] Worker error:", error);
			if (this.activeRequest) {
				this.activeRequest.reject(new Error("Worker encountered an error"));
				this.activeRequest = null;
			}
			this.processQueue();
		};

		this.isInitialized = true;
	}

	private evictOldCache(): void {
		if (this.cache.size <= this.MAX_CACHE_SIZE) return;

		const entries = Array.from(this.cache.entries()).sort(
			(a, b) => a[1].lastUsed - b[1].lastUsed,
		);

		const toRemove = this.cache.size - this.MAX_CACHE_SIZE;
		for (let i = 0; i < toRemove; i++) {
			const [key, entry] = entries[i];
			URL.revokeObjectURL(entry.blobUrl);
			this.cache.delete(key);
		}
	}

	private handleWorkerMessage(message: WorkerResponse): void {
		if (!this.activeRequest) return;

		if (message.requestId !== this.activeRequest.id) {
			console.warn("[TTS Pool] Received response for wrong request, ignoring");
			return;
		}

		switch (message.status) {
			case "progress":
				if (this.activeRequest.onProgress && message.progress !== undefined) {
					this.activeRequest.onProgress(message.progress);
				}
				break;

			case "complete":
				if (message.audio) {
					const blobUrl = URL.createObjectURL(message.audio);
					const audio = new Audio(blobUrl);

					const cacheKey = this.buildCacheKey(this.activeRequest);

					if (this.shouldMemoryCache(this.activeRequest)) {
						// Revoke existing entry if somehow already cached
						const existing = this.cache.get(cacheKey);
						if (existing) {
							URL.revokeObjectURL(existing.blobUrl);
						}

						this.cache.set(cacheKey, { blobUrl, lastUsed: Date.now() });
						this.evictOldCache();
					}
					this.onAudioGenerated(cacheKey, message.audio, this.activeRequest);

					this.activeRequest.resolve(audio);
				} else {
					this.activeRequest.reject(new Error("No audio returned"));
				}
				this.activeRequest = null;
				this.processQueue();
				break;

			case "error":
				this.activeRequest.reject(new Error(message.error || "Unknown error"));
				this.activeRequest = null;
				this.processQueue();
				break;
		}
	}

	protected processQueue(): void {
		if (this.activeRequest || this.requestQueue.length === 0) return;

		// biome-ignore lint/style/noNonNullAssertion: length check above guarantees shift() returns a value
		this.activeRequest = this.requestQueue.shift()!;

		if (!this.worker) {
			this.activeRequest.reject(new Error("Worker not initialized"));
			this.activeRequest = null;
			return;
		}

		this.worker.postMessage(this.buildWorkerMessage(this.activeRequest));
	}

	/** Enqueue a request and return a Promise that resolves with an HTMLAudioElement. */
	protected enqueueRequest(request: TRequest): Promise<HTMLAudioElement> {
		return new Promise<HTMLAudioElement>((resolve, reject) => {
			request.resolve = resolve;
			request.reject = reject;
			this.requestQueue.push(request);
			this.processQueue();
		});
	}

	protected hasCached(cacheKey: string): boolean {
		return this.cache.has(cacheKey);
	}

	/**
	 * Look up a cached audio blob URL and return a new Audio instance, or null on miss.
	 * Updates the LRU timestamp on hit.
	 */
	protected getCachedAudio(cacheKey: string): HTMLAudioElement | null {
		const cached = this.cache.get(cacheKey);
		if (!cached) return null;
		cached.lastUsed = Date.now();
		return new Audio(cached.blobUrl);
	}

	public terminate(): void {
		for (const request of this.requestQueue) {
			request.reject(new Error("Request cancelled"));
		}
		this.requestQueue = [];

		if (this.activeRequest) {
			this.activeRequest.reject(new Error("Worker terminated"));
			this.activeRequest = null;
		}

		for (const entry of this.cache.values()) {
			URL.revokeObjectURL(entry.blobUrl);
		}
		this.cache.clear();

		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}

		this.isInitialized = false;
	}
}
