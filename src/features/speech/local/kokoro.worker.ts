import { Tensor, type InferenceSession } from "onnxruntime-web/wasm";
import { Schema } from "effect";
import { findLocalModel } from "./catalog";
import { modelFile } from "./download";
import { voicePack } from "./archive";
import { Phonemizer } from "./phonemizer";
import { kokoroPhonemes } from "./kokoro-g2p";
import { onnxSession } from "./onnx";
import { pcmToWav } from "./wav";
import { splitSpeechText, mergeAudio, synthesisWorker } from "./synthesis";
import type { LocalResponse } from "./protocol";

const BASE =
	"https://huggingface.co/contextboxai/Kokoro-Vietnamese/resolve/9f210d622209fcc216fe2ac6159fed2ff381cb8a";
const Config = Schema.Struct({
	vocab: Schema.Record(Schema.String, Schema.Int),
	plbert: Schema.Struct({ max_position_embeddings: Schema.Int }),
});
let model:
	| { session: InferenceSession; style: Float32Array; config: typeof Config.Type; g2p: Phonemizer }
	| undefined;
const reply = (response: LocalResponse) => self.postMessage(response);

synthesisWorker(
	async (request) => {
		const voice = findLocalModel("tts", request.model);
		if (
			!voice ||
			voice.engine !== "kokoro" ||
			request.type === "transcribe" ||
			(request.type === "synthesize" && request.language !== "vn")
		)
			throw new Error("Unknown Vietnamese Kokoro voice.");
		if (!model) {
			const [session, style, configBytes, g2p] = await Promise.all([
				onnxSession(BASE, "kokoro_vi.onnx", request.requestId, reply),
				modelFile(
					`${BASE}/voicepacks/${voice.voiceId}.pt`,
					request.requestId,
					reply,
					2 * 1024 * 1024,
				).then(voicePack),
				modelFile(`${BASE}/config.json`, request.requestId, reply, 64 * 1024),
				Phonemizer.create(request.requestId, reply),
			]);
			const config = Schema.decodeUnknownSync(Config)(
				JSON.parse(new TextDecoder().decode(configBytes)),
			);
			model = { session, style, config, g2p };
		}
		if (request.type === "load") {
			reply({ requestId: request.requestId, type: "ready" });
			return;
		}
		reply({ requestId: request.requestId, type: "working" });
		const chunks: Float32Array[] = [];
		for (const text of splitSpeechText(request.text)) {
			const phonemes = kokoroPhonemes(text, (word) => model!.g2p.phonemize(word, false));
			const characters = Array.from(phonemes);
			const ids = characters.flatMap((phone) =>
				model!.config.vocab[phone] === undefined ? [] : [model!.config.vocab[phone]],
			);
			if (!ids.length || ids.length + 2 > model.config.plbert.max_position_embeddings)
				throw new Error("Kokoro phoneme sequence exceeds the model context.");
			const offset = (Math.min(characters.length, 510) - 1) * 256;
			const feeds = {
				input_ids: new Tensor("int64", BigInt64Array.from([0, ...ids, 0], BigInt), [
					1,
					ids.length + 2,
				]),
				ref_s: new Tensor("float32", model.style.slice(offset, offset + 256), [1, 256]),
				speed: new Tensor("float32", Float32Array.of(1), []),
			};
			// oxlint-disable-next-line no-await-in-loop -- Sentence synthesis reuses one model session.
			const output = await model.session.run(feeds);
			const pcm = output[model.session.outputNames[0]]?.data;
			if (!(pcm instanceof Float32Array)) throw new Error("Kokoro returned invalid PCM.");
			chunks.push(pcm);
		}
		reply({
			requestId: request.requestId,
			type: "audio",
			audio: pcmToWav(mergeAudio(chunks, 1200), 24_000),
		});
	},
	reply,
	"Kokoro",
);
