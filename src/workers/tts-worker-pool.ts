import type { VoiceId } from "@diffusionstudio/vits-web";

interface TTSRequest {
	id: string;
	text: string;
	voiceId: VoiceId;
	resolve: (audio: HTMLAudioElement) => void;
	reject: (error: Error) => void;
	onProgress?: (progress: number) => void;
}

interface CacheEntry {
	blobUrl: string;
	lastUsed: number;
}

interface WorkerResponse {
	requestId: string;
	status: "progress" | "complete" | "error";
	progress?: number;
	audio?: Blob;
	error?: string;
}

/**
 * Singleton TTS worker pool that manages a single worker instance.
 * Handles request queuing, audio caching with blob URL lifecycle,
 * and proper cleanup.
 */
class TTSWorkerPool {
	private worker: Worker | null = null;
	private requestQueue: TTSRequest[] = [];
	private activeRequest: TTSRequest | null = null;
	private cache = new Map<string, CacheEntry>();
	private readonly MAX_CACHE_SIZE = 50; // Limit cache to 50 entries
	private isInitialized = false;

	/**
	 * Initialize the worker. Safe to call multiple times.
	 */
	private ensureInitialized(): void {
		if (this.isInitialized && this.worker) return;

		this.worker = new Worker(new URL("./tts-worker.ts", import.meta.url), {
			type: "module",
		});

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

	/**
	 * Generate cache key from text and voice ID
	 */
	private getCacheKey(text: string, voiceId: VoiceId): string {
		return `${voiceId}:${text}`;
	}

	/**
	 * Evict least recently used cache entries if over limit
	 */
	private evictOldCache(): void {
		if (this.cache.size <= this.MAX_CACHE_SIZE) return;

		// Sort by lastUsed (oldest first)
		const entries = Array.from(this.cache.entries()).sort(
			(a, b) => a[1].lastUsed - b[1].lastUsed,
		);

		// Remove oldest entries
		const toRemove = this.cache.size - this.MAX_CACHE_SIZE;
		for (let i = 0; i < toRemove; i++) {
			const [key, entry] = entries[i];
			URL.revokeObjectURL(entry.blobUrl);
			this.cache.delete(key);
		}
	}

	/**
	 * Handle messages from the worker
	 */
	private handleWorkerMessage(message: WorkerResponse): void {
		if (!this.activeRequest) return;

		// Validate requestId to prevent stale responses from resolving wrong promises
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

					// Cache the blob URL
					const cacheKey = this.getCacheKey(
						this.activeRequest.text,
						this.activeRequest.voiceId,
					);

					// If we already have this in cache (shouldn't happen), revoke old URL
					const existing = this.cache.get(cacheKey);
					if (existing) {
						URL.revokeObjectURL(existing.blobUrl);
					}

					this.cache.set(cacheKey, {
						blobUrl,
						lastUsed: Date.now(),
					});

					this.evictOldCache();

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

	/**
	 * Process the next request in the queue
	 */
	private processQueue(): void {
		if (this.activeRequest || this.requestQueue.length === 0) return;

		// biome-ignore lint/style/noNonNullAssertion: length check above guarantees shift() returns a value
		this.activeRequest = this.requestQueue.shift()!;

		if (!this.worker) {
			this.activeRequest.reject(new Error("Worker not initialized"));
			this.activeRequest = null;
			return;
		}

		this.worker.postMessage({
			type: "predict",
			text: this.activeRequest.text,
			voiceId: this.activeRequest.voiceId,
			requestId: this.activeRequest.id,
		});
	}

	/**
	 * Request audio generation. Returns cached audio immediately if available.
	 */
	public async generateAudio(
		text: string,
		voiceId: VoiceId,
		onProgress?: (progress: number) => void,
	): Promise<HTMLAudioElement> {
		const cacheKey = this.getCacheKey(text, voiceId);

		// Check cache first
		const cached = this.cache.get(cacheKey);
		if (cached) {
			cached.lastUsed = Date.now();
			// Return new Audio instance to avoid race conditions with shared elements
			const audio = new Audio(cached.blobUrl);
			return audio;
		}

		this.ensureInitialized();

		return new Promise<HTMLAudioElement>((resolve, reject) => {
			const request: TTSRequest = {
				id: crypto.randomUUID(),
				text,
				voiceId,
				resolve,
				reject,
				onProgress,
			};

			this.requestQueue.push(request);
			this.processQueue();
		});
	}

	/**
	 * Cancel all pending requests (but not active request)
	 */
	public cancelPendingRequests(): void {
		for (const request of this.requestQueue) {
			request.reject(new Error("Request cancelled"));
		}
		this.requestQueue = [];
	}

	/**
	 * Clear cache for a specific voice ID (e.g., when voice changes)
	 */
	public clearCacheForVoice(voiceId: VoiceId): void {
		for (const [key, entry] of this.cache.entries()) {
			if (key.startsWith(`${voiceId}:`)) {
				URL.revokeObjectURL(entry.blobUrl);
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Clear all cache
	 */
	public clearCache(): void {
		for (const entry of this.cache.values()) {
			URL.revokeObjectURL(entry.blobUrl);
		}
		this.cache.clear();
	}

	/**
	 * Terminate the worker and clean up all resources.
	 * Should be called when the app is shutting down or navigating away.
	 */
	public terminate(): void {
		this.cancelPendingRequests();

		if (this.activeRequest) {
			this.activeRequest.reject(new Error("Worker terminated"));
			this.activeRequest = null;
		}

		this.clearCache();

		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}

		this.isInitialized = false;
	}

	/**
	 * Check if a specific audio is cached
	 */
	public isCached(text: string, voiceId: VoiceId): boolean {
		return this.cache.has(this.getCacheKey(text, voiceId));
	}
}

// Export singleton instance
export const ttsPool = new TTSWorkerPool();

// Cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		ttsPool.terminate();
	});
}
