import { getVoiceAudio, saveVoiceAudio } from "~/utils/audio-cache";
import { type BaseTTSRequest, BaseTTSWorkerPool } from "./base-tts-worker-pool";
import type { ModelDType } from "./worker-types";

const VN_MMS_MODEL = "Xenova/mms-tts-vie";

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

	protected shouldMemoryCache(request: TTSMMSRequest): boolean {
		return request.modelId !== VN_MMS_MODEL;
	}

	protected onAudioGenerated(
		_cacheKey: string,
		blob: Blob,
		request: TTSMMSRequest,
	): void {
		if (request.modelId !== VN_MMS_MODEL) return;
		saveVoiceAudio(request.text, request.modelId, blob).catch(() => {});
	}

	/**
	 * Request audio generation. Returns cached audio immediately if available,
	 * then checks the IndexedDB persistent cache (Vietnamese only) before
	 * falling through to the worker.
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

		if (modelId === VN_MMS_MODEL) {
			const blob = await getVoiceAudio(text, modelId);
			if (blob) return new Audio(URL.createObjectURL(blob));
		}

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
	 * Check if audio is cached in memory or (for Vietnamese) IndexedDB.
	 */
	public async isCached(text: string, modelId: string): Promise<boolean> {
		if (modelId === VN_MMS_MODEL) {
			return (await getVoiceAudio(text, modelId)) !== null;
		}
		return this.hasCached(`${modelId}:${text}`);
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
