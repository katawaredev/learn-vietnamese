import createPiperPhonemize from "@diffusionstudio/piper-wasm";
import phonemizerWasm from "@diffusionstudio/piper-wasm/build/piper_phonemize.wasm?url";
import phonemizerData from "@diffusionstudio/piper-wasm/build/piper_phonemize.data?url";
import { env, InferenceSession, Tensor } from "onnxruntime-web/wasm";
import ortWasm from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import { Schema } from "effect";
import { findLocalModel } from "./catalog";
import { PiperConfig, PhonemizerOutput, phonemesToIds } from "./piper-contracts";
import { pcmToWav } from "./wav";
import { modelFile } from "./download";
import { LocalRequest, type LocalResponse } from "./protocol";

env.wasm.numThreads = 1;
env.wasm.proxy = false;
env.wasm.wasmPaths = { wasm: new URL(ortWasm, self.location.href).href };
let session: InferenceSession | undefined;
let config: PiperConfig | undefined;
const reply = (response: LocalResponse) => self.postMessage(response);

async function phonemize(text: string, voice: string): Promise<readonly string[]> {
	const lines: string[] = [];
	const module = await createPiperPhonemize({
		print: (line) => lines.push(line),
		printErr: () => {},
		locateFile: (file) =>
			new URL(file.endsWith(".wasm") ? phonemizerWasm : phonemizerData, self.location.href).href,
	});
	module.callMain([
		"-l",
		voice,
		"--input",
		JSON.stringify([{ text }]),
		"--espeak_data",
		"/espeak-ng-data",
	]);
	if (!lines.length) throw new Error("Piper phonemizer returned no output.");
	return lines.flatMap(
		(line) => Schema.decodeUnknownSync(PhonemizerOutput)(JSON.parse(line)).phonemes,
	);
}

async function handle(request: LocalRequest) {
	const voice = findLocalModel("tts", request.model);
	if (!voice || voice.engine !== "piper" || request.type === "transcribe")
		throw new Error("Unknown Piper voice.");
	if (request.type === "synthesize" && !voice.languages.includes(request.language))
		throw new Error("Unsupported voice language.");
	if (!session || !config) {
		const [locale, speaker, quality] = voice.voiceId.split("-");
		const path = `${locale.split("_")[0]}/${locale}/${speaker}/${quality}/${voice.voiceId}.onnx`;
		const base =
			"https://huggingface.co/diffusionstudio/piper-voices/resolve/840e38a7e26d813bd6221b78cfbaefa3585b3f71";
		const bytes = await modelFile(
			`${base}/${path}.json`,
			request.requestId,
			reply,
			256 * 1024 * 1024,
		);
		config = Schema.decodeUnknownSync(PiperConfig)(JSON.parse(new TextDecoder().decode(bytes)));
		session = await InferenceSession.create(
			await modelFile(`${base}/${path}`, request.requestId, reply, 256 * 1024 * 1024),
			{
				executionProviders: ["wasm"],
			},
		);
	}
	if (request.type === "load") {
		reply({ requestId: request.requestId, type: "ready" });
		return;
	}
	reply({ requestId: request.requestId, type: "working" });
	const ids = phonemesToIds(await phonemize(request.text, config.espeak.voice), config);
	const feeds: Record<string, Tensor> = {
		input: new Tensor("int64", BigInt64Array.from(ids, BigInt), [1, ids.length]),
		input_lengths: new Tensor("int64", BigInt64Array.of(BigInt(ids.length)), [1]),
		scales: new Tensor(
			"float32",
			Float32Array.of(
				config.inference.noise_scale,
				config.inference.length_scale,
				config.inference.noise_w,
			),
			[3],
		),
	};
	if (config.num_speakers > 1) feeds.sid = new Tensor("int64", BigInt64Array.of(0n), [1]);
	const output = (await session.run(feeds)).output;
	if (!output || !(output.data instanceof Float32Array))
		throw new Error("Piper returned invalid PCM.");
	reply({
		requestId: request.requestId,
		type: "audio",
		audio: pcmToWav(output.data, config.audio.sample_rate),
	});
}

let queue = Promise.resolve();
self.addEventListener("message", (event: MessageEvent<unknown>) => {
	queue = queue
		.then(async () => {
			const request = Schema.decodeUnknownSync(LocalRequest)(event.data);
			try {
				await handle(request);
			} catch (error) {
				console.error("Local Piper model failed", error);
				reply({
					requestId: request.requestId,
					type: "error",
					message:
						"Piper voice failed to load or run. Check your connection, storage and available memory, or choose another voice.",
				});
			}
		})
		.catch(() => {});
});
