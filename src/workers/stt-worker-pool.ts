type Language = "vn" | "en";

interface STTRequest {
	id: string;
	audio: Float32Array;
	language: Language;
	resolve: (text: string) => void;
	reject: (error: Error) => void;
}

interface ModelInitWaiter {
	resolve: () => void;
	reject: (error: Error) => void;
	onProgress?: (progress: number) => void;
}

interface ModelInitState {
	modelPath: string;
	waiters: ModelInitWaiter[];
}

interface WorkerResponse {
	status: "progress" | "ready" | "complete" | "error";
	progress?: number;
	text?: string;
	error?: string;
}

/**
 * Singleton STT worker pool that manages a single worker instance.
 * Handles model switching, request queuing, and proper cleanup.
 */
// iOS Safari kills the tab if WASM model memory stays resident after transcription.
// Detecting iOS once at pool creation is sufficient.
const isIOS =
	typeof navigator !== "undefined" &&
	(/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

class STTWorkerPool {
	private worker: Worker | null = null;
	private currentModelPath: string | null = null;
	private isModelLoading = false;
	private pendingModelInit: ModelInitState | null = null;
	private requestQueue: STTRequest[] = [];
	private activeRequest: STTRequest | null = null;
	private isInitialized = false;

	/**
	 * Initialize the worker. Safe to call multiple times.
	 */
	private ensureInitialized(): void {
		if (this.isInitialized && this.worker) return;

		this.worker = new Worker(new URL("./stt-worker.ts", import.meta.url), {
			type: "module",
		});

		this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			this.handleWorkerMessage(event.data);
		};

		this.worker.onerror = (error) => {
			console.error("[STT Pool] Worker error:", error);

			if (this.pendingModelInit) {
				const err = new Error("Worker encountered an error");
				for (const waiter of this.pendingModelInit.waiters) {
					waiter.reject(err);
				}
				this.pendingModelInit = null;
				this.isModelLoading = false;
			}

			if (this.activeRequest) {
				this.activeRequest.reject(new Error("Worker encountered an error"));
				this.activeRequest = null;
			}

			// Reset so ensureInitialized() creates a fresh worker on the next call
			// instead of reusing a dead/crashed worker instance.
			this.worker = null;
			this.isInitialized = false;
			this.currentModelPath = null;

			this.processQueue();
		};

		this.isInitialized = true;
	}

	/**
	 * Handle messages from the worker
	 */
	private handleWorkerMessage(message: WorkerResponse): void {
		switch (message.status) {
			case "progress":
				if (this.pendingModelInit && message.progress !== undefined) {
					for (const waiter of this.pendingModelInit.waiters) {
						waiter.onProgress?.(message.progress);
					}
				}
				break;

			case "ready":
				if (this.pendingModelInit) {
					for (const waiter of this.pendingModelInit.waiters) {
						waiter.resolve();
					}
					this.pendingModelInit = null;
				}
				this.isModelLoading = false;
				this.processQueue();
				break;

			case "complete":
				if (this.activeRequest) {
					this.activeRequest.resolve(message.text || "");
					this.activeRequest = null;
				}
				// On iOS the worker disposed the model to free WASM memory —
				// reset so the next transcribe call knows to reload it.
				if (isIOS) {
					this.currentModelPath = null;
				}
				this.processQueue();
				break;

			case "error":
				if (this.isModelLoading && this.pendingModelInit) {
					const err = new Error(message.error || "Model initialization failed");
					for (const waiter of this.pendingModelInit.waiters) {
						waiter.reject(err);
					}
					this.pendingModelInit = null;
					this.isModelLoading = false;
				} else if (this.activeRequest) {
					this.activeRequest.reject(
						new Error(message.error || "Transcription failed"),
					);
					this.activeRequest = null;
				}
				this.processQueue();
				break;
		}
	}

	/**
	 * Process the next request in the queue
	 */
	private processQueue(): void {
		if (
			this.activeRequest ||
			this.isModelLoading ||
			this.requestQueue.length === 0
		) {
			return;
		}

		// biome-ignore lint/style/noNonNullAssertion: length check above guarantees shift() returns a value
		this.activeRequest = this.requestQueue.shift()!;

		if (!this.worker) {
			this.activeRequest.reject(new Error("Worker not initialized"));
			this.activeRequest = null;
			return;
		}

		// Transfer Float32Array ownership to avoid copying
		const audio = this.activeRequest.audio;
		this.worker.postMessage(
			{
				type: "transcribe",
				audio,
				language: this.activeRequest.language,
				disposeAfterUse: isIOS,
			},
			[audio.buffer],
		);
	}

	/**
	 * Initialize or switch to a different model
	 */
	public async initModel(
		modelPath: string,
		language: Language,
		onProgress?: (progress: number) => void,
	): Promise<void> {
		// If model is already loaded, skip
		if (this.currentModelPath === modelPath && !this.isModelLoading) {
			return Promise.resolve();
		}

		// If we're currently loading this same model, add to waiters
		if (
			this.isModelLoading &&
			this.pendingModelInit &&
			this.currentModelPath === modelPath
		) {
			return new Promise((resolve, reject) => {
				this.pendingModelInit?.waiters.push({ resolve, reject, onProgress });
			});
		}

		this.ensureInitialized();

		// Cancel any pending init if switching models
		if (this.pendingModelInit) {
			const err = new Error("Model init cancelled");
			for (const waiter of this.pendingModelInit.waiters) {
				waiter.reject(err);
			}
		}

		this.currentModelPath = modelPath;
		this.isModelLoading = true;

		return new Promise<void>((resolve, reject) => {
			this.pendingModelInit = {
				modelPath,
				waiters: [{ resolve, reject, onProgress }],
			};

			this.worker?.postMessage({
				type: "init",
				modelPath,
				language,
			});
		});
	}

	/**
	 * Transcribe audio. Automatically initializes model if needed.
	 */
	public async transcribe(
		audio: Float32Array,
		modelPath: string,
		language: Language,
		onProgress?: (progress: number) => void,
	): Promise<string> {
		// Ensure model is loaded
		await this.initModel(modelPath, language, onProgress);

		return new Promise<string>((resolve, reject) => {
			const request: STTRequest = {
				id: crypto.randomUUID(),
				audio,
				language,
				resolve,
				reject,
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
	 * Terminate the worker and clean up all resources.
	 */
	public terminate(): void {
		this.cancelPendingRequests();

		if (this.pendingModelInit) {
			const err = new Error("Worker terminated");
			for (const waiter of this.pendingModelInit.waiters) {
				waiter.reject(err);
			}
			this.pendingModelInit = null;
		}

		if (this.activeRequest) {
			this.activeRequest.reject(new Error("Worker terminated"));
			this.activeRequest = null;
		}

		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}

		this.currentModelPath = null;
		this.isModelLoading = false;
		this.isInitialized = false;
	}

	/**
	 * Check if a model is currently loaded
	 */
	public isModelLoaded(modelPath: string): boolean {
		return this.currentModelPath === modelPath && !this.isModelLoading;
	}

	/**
	 * Get the currently loaded model path
	 */
	public getCurrentModelPath(): string | null {
		return this.currentModelPath;
	}
}

// Export singleton instance
export const sttPool = new STTWorkerPool();

// Cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		sttPool.terminate();
	});
}
