import { pipeline } from "@huggingface/transformers";
import "./transformers-config";
import type { ErrorResponse, ProgressResponse } from "./worker-types";

// Message types
interface PredictMessage {
	type: "predict";
	text: string;
	modelId: string;
	requestId: string;
}

type WorkerMessage = PredictMessage;

// Response types specific to TTS
interface CompleteResponse {
	requestId: string;
	status: "complete";
	audio: Blob;
}

// Cache pipelines per model to avoid re-initialization
// biome-ignore lint/suspicious/noExplicitAny: Pipeline return type is too complex
const pipelineCache = new Map<string, any>();

/**
 * Convert Float32Array audio to WAV Blob
 */
function audioToWav(audioData: Float32Array, sampleRate: number): Blob {
	const wavHeader = new ArrayBuffer(44);
	const view = new DataView(wavHeader);

	// RIFF chunk descriptor
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + audioData.length * 2, true);
	writeString(view, 8, "WAVE");

	// fmt sub-chunk
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
	view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
	view.setUint16(22, 1, true); // NumChannels (1 for mono)
	view.setUint32(24, sampleRate, true); // SampleRate
	view.setUint32(28, sampleRate * 2, true); // ByteRate
	view.setUint16(32, 2, true); // BlockAlign
	view.setUint16(34, 16, true); // BitsPerSample

	// data sub-chunk
	writeString(view, 36, "data");
	view.setUint32(40, audioData.length * 2, true);

	// Convert Float32Array to Int16Array
	const int16Data = new Int16Array(audioData.length);
	for (let i = 0; i < audioData.length; i++) {
		const s = Math.max(-1, Math.min(1, audioData[i]));
		int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
	}

	return new Blob([wavHeader, int16Data.buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

// Message handler
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
	const message = event.data;

	try {
		switch (message.type) {
			case "predict": {
				// Get or create pipeline for this model
				let synthesizer = pipelineCache.get(message.modelId);

				if (!synthesizer) {
					synthesizer = await pipeline("text-to-speech", message.modelId, {
						progress_callback: (progress) => {
							if (progress.status === "progress") {
								const progressPercent =
									progress.total > 0
										? (progress.loaded / progress.total) * 100
										: 0;
								self.postMessage({
									requestId: message.requestId,
									status: "progress",
									url: progress.file,
									progress: progressPercent,
									loaded: progress.loaded,
									total: progress.total,
								} satisfies ProgressResponse);
							}
						},
					});
					pipelineCache.set(message.modelId, synthesizer);
				}

				// Generate speech
				const output = (await synthesizer(message.text)) as {
					audio: Float32Array;
					sampling_rate: number;
				};

				// Convert to WAV Blob
				const wav = audioToWav(output.audio, output.sampling_rate);

				self.postMessage({
					requestId: message.requestId,
					status: "complete",
					audio: wav,
				} as CompleteResponse);
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
