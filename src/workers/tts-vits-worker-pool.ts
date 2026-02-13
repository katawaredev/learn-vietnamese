import type { VoiceId } from "@diffusionstudio/vits-web";
import { type BaseTTSRequest, BaseTTSWorkerPool } from "./base-tts-worker-pool";

interface TTSVitsRequest extends BaseTTSRequest {
	voiceId: VoiceId;
}

/**
 * Singleton VITS TTS worker pool that manages a single worker instance.
 * Handles request queuing, audio caching with blob URL lifecycle,
 * and proper cleanup.
 */
class TTSVitsWorkerPool extends BaseTTSWorkerPool<TTSVitsRequest> {
	protected createWorker(): Worker {
		return new Worker(new URL("./tts-vits-worker.ts", import.meta.url), {
			type: "module",
		});
	}

	protected buildCacheKey(request: TTSVitsRequest): string {
		return `${request.voiceId}:${request.text}`;
	}

	protected buildWorkerMessage(
		request: TTSVitsRequest,
	): Record<string, unknown> {
		return {
			type: "predict",
			text: request.text,
			voiceId: request.voiceId,
			requestId: request.id,
		};
	}

	/**
	 * Request audio generation. Returns cached audio immediately if available.
	 */
	public async generateAudio(
		text: string,
		voiceId: VoiceId,
		onProgress?: (progress: number) => void,
	): Promise<HTMLAudioElement> {
		const cacheKey = `${voiceId}:${text}`;

		const cached = this.getCachedAudio(cacheKey);
		if (cached) return cached;

		this.ensureInitialized();

		return this.enqueueRequest({
			id: crypto.randomUUID(),
			text,
			voiceId,
			onProgress,
			// resolve/reject are assigned inside enqueueRequest
			resolve: () => {},
			reject: () => {},
		});
	}

	/**
	 * Check if a specific audio is cached
	 */
	public isCached(text: string, voiceId: VoiceId): boolean {
		return this.cache.has(`${voiceId}:${text}`);
	}

	/**
	 * Clear cache for a specific voice ID (e.g., when voice changes)
	 */
	public clearCacheForVoice(voiceId: VoiceId): void {
		this.clearCacheByPrefix(`${voiceId}:`);
	}
}

// Export singleton instance
export const ttsVitsPool = new TTSVitsWorkerPool();

// Cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		ttsVitsPool.terminate();
	});
}
