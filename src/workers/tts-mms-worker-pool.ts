import { type BaseTTSRequest, BaseTTSWorkerPool } from "./base-tts-worker-pool";
import type { ModelDType } from "./worker-types";

interface TTSMMSRequest extends BaseTTSRequest {
	modelId: string;
	device: "webgpu" | "wasm";
	dtype: ModelDType;
}

/**
 * Singleton MMS TTS worker pool that manages a single worker instance.
 * Handles request queuing, audio caching with blob URL lifecycle,
 * and proper cleanup.
 */
class TTSMMSWorkerPool extends BaseTTSWorkerPool<TTSMMSRequest> {
	protected createWorker(): Worker {
		return new Worker(new URL("./tts-mms-worker.ts", import.meta.url), {
			type: "module",
		});
	}

	protected buildCacheKey(request: TTSMMSRequest): string {
		return `${request.modelId}:${request.text}`;
	}

	protected buildWorkerMessage(
		request: TTSMMSRequest,
	): Record<string, unknown> {
		return {
			type: "predict",
			text: request.text,
			modelId: request.modelId,
			device: request.device,
			dtype: request.dtype,
			requestId: request.id,
		};
	}

	/**
	 * Request audio generation. Returns cached audio immediately if available.
	 */
	public async generateAudio(
		text: string,
		modelId: string,
		device: "webgpu" | "wasm" = "wasm",
		dtype: ModelDType = "q8",
		onProgress?: (progress: number) => void,
	): Promise<HTMLAudioElement> {
		const cacheKey = `${modelId}:${text}`;

		const cached = this.getCachedAudio(cacheKey);
		if (cached) return cached;

		this.ensureInitialized();

		return this.enqueueRequest({
			id: crypto.randomUUID(),
			text,
			modelId,
			device,
			dtype,
			onProgress,
			// resolve/reject are assigned inside enqueueRequest
			resolve: () => {},
			reject: () => {},
		});
	}

	/**
	 * Check if a specific audio is cached
	 */
	public isCached(text: string, modelId: string): boolean {
		return this.cache.has(`${modelId}:${text}`);
	}

	/**
	 * Clear cache for a specific model ID (e.g., when model changes)
	 */
	public clearCacheForModel(modelId: string): void {
		this.clearCacheByPrefix(`${modelId}:`);
	}
}

// Export singleton instance
export const ttsMMSPool = new TTSMMSWorkerPool();

// Cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		ttsMMSPool.terminate();
	});
}
