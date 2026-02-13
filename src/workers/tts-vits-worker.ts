import { predict, type VoiceId } from "@diffusionstudio/vits-web";
import type { ErrorResponse, TTSProgressResponse } from "./worker-types";

// Message types
interface PredictMessage {
	type: "predict";
	text: string;
	voiceId: VoiceId;
	requestId: string;
}

type WorkerMessage = PredictMessage;

// Response types specific to VITS
interface CompleteResponse {
	requestId: string;
	status: "complete";
	audio: Blob;
}

// Message handler
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
	const message = event.data;

	try {
		switch (message.type) {
			case "predict": {
				const wav = await predict(
					{
						text: message.text,
						voiceId: message.voiceId,
					},
					(progress) => {
						// Forward progress to main thread
						const progressPercent =
							progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
						self.postMessage({
							requestId: message.requestId,
							status: "progress",
							url: progress.url,
							progress: progressPercent,
							loaded: progress.loaded,
							total: progress.total,
						} satisfies TTSProgressResponse);
					},
				);

				self.postMessage({
					requestId: message.requestId,
					status: "complete",
					audio: wav,
				} satisfies CompleteResponse);
				break;
			}
		}
	} catch (error) {
		self.postMessage({
			requestId: message.requestId,
			status: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		} satisfies ErrorResponse);
	}
});
