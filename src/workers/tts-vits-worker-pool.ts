import type { VoiceId } from "@diffusionstudio/vits-web";
import { getVoiceAudio, saveVoiceAudio } from "~/utils/audio-cache";
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

	private static isVietnamese(voiceId: VoiceId): boolean {
		return (voiceId as string).startsWith("vi_");
	}

	protected shouldMemoryCache(request: TTSVitsRequest): boolean {
		return !TTSVitsWorkerPool.isVietnamese(request.voiceId);
	}

	protected onAudioGenerated(
		_cacheKey: string,
		blob: Blob,
		request: TTSVitsRequest,
	): void {
		if (!TTSVitsWorkerPool.isVietnamese(request.voiceId)) return;
		saveVoiceAudio(request.text, request.voiceId as string, blob).catch(
			() => {},
		);
	}

	/**
	 * Request audio generation. Returns cached audio immediately if available,
	 * then checks the IndexedDB persistent cache (Vietnamese voices only) before
	 * falling through to the worker.
	 */
	public async generateAudio(
		text: string,
		voiceId: VoiceId,
		onProgress?: (progress: number) => void,
	): Promise<HTMLAudioElement> {
		const cacheKey = `${voiceId}:${text}`;

		const cached = this.getCachedAudio(cacheKey);
		if (cached) return cached;

		if (TTSVitsWorkerPool.isVietnamese(voiceId)) {
			const blob = await getVoiceAudio(text, voiceId as string);
			if (blob) return new Audio(URL.createObjectURL(blob));
		}

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
	 * Check if audio is cached in memory or (for Vietnamese) IndexedDB.
	 */
	public async isCached(text: string, voiceId: VoiceId): Promise<boolean> {
		if (TTSVitsWorkerPool.isVietnamese(voiceId)) {
			return (await getVoiceAudio(text, voiceId as string)) !== null;
		}
		return this.hasCached(`${voiceId}:${text}`);
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
