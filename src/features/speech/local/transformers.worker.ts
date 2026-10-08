import {
	env,
	pipeline,
	type TextToAudioPipeline,
	type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";
import { Schema } from "effect";
import { findLocalModel } from "./catalog";
import { LocalRequest, type LocalResponse } from "./protocol";
import { pcmToWav } from "./wav";

env.allowLocalModels = false;
env.useBrowserCache = true;
// Single-thread WASM works on ordinary HTTPS hosts without COOP/COEP headers.
if (env.backends.onnx.wasm) {
	env.backends.onnx.wasm.numThreads = 1;
	env.backends.onnx.wasm.proxy = false;
}
let synthesizer: TextToAudioPipeline | undefined;
let transcriber: AutomaticSpeechRecognitionPipeline | undefined;
let modelId: string | undefined;

const reply = (response: LocalResponse) => self.postMessage(response);
async function handle(request: LocalRequest) {
	const model = findLocalModel("tts", request.model) ?? findLocalModel("stt", request.model);
	if (!model || (model.engine !== "mms" && model.engine !== "whisper"))
		throw new Error("Unknown local model.");
	if (request.type !== "load" && !model.languages.includes(request.language))
		throw new Error("Unsupported model language.");
	if (modelId !== model.id) {
		await synthesizer?.dispose();
		await transcriber?.dispose();
		synthesizer = undefined;
		transcriber = undefined;
		const options = {
			device: "wasm" as const,
			dtype: "q8" as const,
			revision: model.revision,
			progress_callback: (progress: import("@huggingface/transformers").ProgressInfo) => {
				if (progress.status === "progress")
					reply({
						requestId: request.requestId,
						type: "progress",
						file: progress.file,
						progress: progress.progress,
					});
			},
		};
		if (model.engine === "mms")
			synthesizer = await pipeline("text-to-speech", model.modelId, options);
		else transcriber = await pipeline("automatic-speech-recognition", model.modelId, options);
		modelId = model.id;
	}
	if (request.type === "load") reply({ requestId: request.requestId, type: "ready" });
	else if (request.type === "synthesize" && synthesizer) {
		reply({ requestId: request.requestId, type: "working" });
		const output = await synthesizer(request.text);
		reply({
			requestId: request.requestId,
			type: "audio",
			audio: pcmToWav(output.data, output.sampling_rate),
		});
	} else if (request.type === "transcribe" && transcriber) {
		reply({ requestId: request.requestId, type: "working" });
		if (!request.audio.length || request.audio.length > 16_000 * 60)
			throw new Error("Invalid recording length.");
		const output = await transcriber(request.audio, {
			language: request.language === "vn" ? "vietnamese" : "english",
			task: "transcribe",
			chunk_length_s: 30,
			stride_length_s: 5,
		});
		reply({ requestId: request.requestId, type: "transcript", text: output.text.trim() });
	} else throw new Error("Invalid operation for this model.");
}

// Pipelines are mutable and must never run two generations concurrently.
let queue = Promise.resolve();
self.addEventListener("message", (event: MessageEvent<unknown>) => {
	queue = queue
		.then(async () => {
			const request = Schema.decodeUnknownSync(LocalRequest)(event.data);
			try {
				await handle(request);
			} catch (error) {
				console.error("Local speech model failed", error);
				reply({
					requestId: request.requestId,
					type: "error",
					message:
						"Local model failed to load or run. Check your connection, storage and available memory, or choose a smaller model.",
				});
			}
		})
		.catch(() => {});
});
