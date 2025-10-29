import {
	type AutomaticSpeechRecognitionOutput,
	type AutomaticSpeechRecognitionPipeline,
	pipeline,
} from "@huggingface/transformers";
import "./transformers-config";
import type { ErrorResponse, ProgressResponse } from "./worker-types";

// Message types
interface InitMessage {
	type: "init";
	modelPath: string;
	language: "vn" | "en";
}

interface TranscribeMessage {
	type: "transcribe";
	audio: Float32Array;
	language: "vn" | "en";
}

type WorkerMessage = InitMessage | TranscribeMessage;

// Response types specific to STT
interface ReadyResponse {
	status: "ready";
}

interface TranscribeResponse {
	status: "complete";
	text: string;
}

// Model instance
let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let currentModelPath: string | null = null;

// Initialize the model
async function initModel(modelPath: string) {
	// If model is already loaded with the same path, skip
	if (transcriber && currentModelPath === modelPath) {
		self.postMessage({ status: "ready" } as ReadyResponse);
		return;
	}

	// Dispose of old model if exists
	if (transcriber) {
		transcriber = null;
	}

	currentModelPath = modelPath;

	// Load new model with progress tracking
	const model = await pipeline("automatic-speech-recognition", modelPath, {
		progress_callback: (progress) => {
			// Forward progress to main thread
			if (progress.status === "progress") {
				self.postMessage({
					status: "progress",
					file: progress.file,
					progress: progress.progress || 0,
					loaded: progress.loaded || 0,
					total: progress.total || 0,
				} satisfies ProgressResponse);
			}
		},
	});

	transcriber = model as AutomaticSpeechRecognitionPipeline;

	self.postMessage({ status: "ready" } as ReadyResponse);
}

// Transcribe audio
async function transcribe(audio: Float32Array, language: "vn" | "en") {
	if (!transcriber) {
		throw new Error("Model not initialized");
	}

	const result = (await transcriber(audio, {
		language: language === "vn" ? "vietnamese" : "english",
		task: "transcribe",
	})) as AutomaticSpeechRecognitionOutput;

	return result.text || "";
}

// Message handler
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
	const message = event.data;

	try {
		switch (message.type) {
			case "init":
				await initModel(message.modelPath);
				break;

			case "transcribe": {
				const text = await transcribe(message.audio, message.language);
				self.postMessage({
					status: "complete",
					text,
				} as TranscribeResponse);
				break;
			}
		}
	} catch (error) {
		console.error("Worker error:", error);
		self.postMessage({
			status: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		} satisfies ErrorResponse);
	}
});
