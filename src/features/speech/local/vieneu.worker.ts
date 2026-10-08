import { Tensor, type InferenceSession } from "onnxruntime-web/wasm";
import { Schema } from "effect";
import { findLocalModel } from "./catalog";
import { modelFile } from "./download";
import { numpyFloat32, zipEntries } from "./archive";
import { Phonemizer } from "./phonemizer";
import { vieneuTokenizer } from "./vieneu-tokenizer";
import { project, argmax, sample, maxFrames } from "./vieneu-math";
import { onnxSession } from "./onnx";
import { pcmToWav } from "./wav";
import { splitSpeechText, mergeAudio, synthesisWorker } from "./synthesis";
import type { LocalResponse } from "./protocol";

const ROOT =
	"https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo/resolve/61b85e3d937fbbacb387714180e8182823512523";
const BASE = `${ROOT}/onnx_int8`;
const CODEC =
	"https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX/resolve/ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae";
const HIDDEN = 768;
const CHANNELS = 16;
const VOCAB = 1024;
const LAYERS = 12;
const Config = Schema.Struct({
	n_vq: Schema.Literal(CHANNELS),
	hidden_size: Schema.Literal(HIDDEN),
	num_hidden_layers: Schema.Literal(LAYERS),
	text_vocab_size: Schema.Literal(419),
	audio_vocab_size: Schema.Literal(VOCAB),
	audio_pad_token_id: Schema.Int,
	text_prompt_start_token_id: Schema.Int,
	text_prompt_end_token_id: Schema.Int,
	speech_generation_start_token_id: Schema.Int,
	speech_generation_end_token_id: Schema.Int,
	audio_ref_slot_token_id: Schema.Int,
	default_style_token_id: Schema.Int,
});
interface Model {
	pre: InferenceSession;
	decode: InferenceSession;
	acoustic: InferenceSession;
	codec: InferenceSession;
	text: Float32Array;
	audio: Float32Array;
	anchor: Float32Array;
	reference: number[][];
	config: typeof Config.Type;
	tokenize: (text: string) => number[];
	g2p: Phonemizer;
}
let loadedModel: Model | undefined;
const reply = (response: LocalResponse) => self.postMessage(response);
const json = (bytes: ArrayBuffer): unknown => JSON.parse(new TextDecoder().decode(bytes));
function floats(text: string) {
	const values = text
		.trim()
		.split(/[\s,]+/)
		.map(Number);
	if (!values.length || !values.every(Number.isFinite)) throw new Error("Invalid VieNeu preset.");
	return values;
}
async function load(voiceId: string, requestId: string): Promise<Model> {
	const download = (url: string) => modelFile(url, requestId, reply);
	const [shared, codecShared, headsBytes, configBytes, tokenizerBytes, speaker, codes, g2p] =
		await Promise.all([
			download(`${BASE}/vieneu_backbone_shared.data`),
			download(`${CODEC}/moss_audio_tokenizer_decode_shared.data`),
			download(`${BASE}/vieneu_v3_heads.npz`),
			download(`${BASE}/config.json`),
			download(`${BASE}/tokenizer.json`),
			download(`${ROOT}/gguf/voices/${voiceId}/speaker.emb.txt`),
			download(`${ROOT}/gguf/voices/${voiceId}/ref_codes.txt`),
			Phonemizer.create(requestId, reply),
		]);
	const config = Schema.decodeUnknownSync(Config)(json(configBytes));
	const entries = zipEntries(headsBytes);
	const head = (key: string, dims: number[]) => {
		const bytes = entries.get(`${key}.npy`);
		if (!bytes) throw new Error("Missing VieNeu head.");
		const value = numpyFloat32(bytes);
		if (JSON.stringify(value.dims) !== JSON.stringify(dims))
			throw new Error("Invalid VieNeu head shape.");
		return value.data;
	};
	const embedding = Float32Array.from(floats(new TextDecoder().decode(speaker)));
	if (embedding.length !== 192 || !embedding.some((value) => value !== 0))
		throw new Error("Invalid speaker embedding.");
	const anchor = project(embedding, head("xvec_w", [HIDDEN, 192]), HIDDEN);
	const bias = head("xvec_b", [HIDDEN]),
		weight = head("xvec_ln_w", [HIDDEN]),
		normBias = head("xvec_ln_b", [HIDDEN]);
	for (let i = 0; i < HIDDEN; i++) anchor[i] += bias[i];
	const mean = anchor.reduce((a, b) => a + b, 0) / HIDDEN;
	const variance = anchor.reduce((a, b) => a + (b - mean) ** 2, 0) / HIDDEN;
	const scale = Math.sqrt(variance + head("xvec_ln_eps", [])[0]);
	for (let i = 0; i < HIDDEN; i++)
		anchor[i] = ((anchor[i] - mean) / scale) * weight[i] + normBias[i];
	const reference = new TextDecoder().decode(codes).trim().split(/\r?\n/).map(floats);
	if (
		reference.length > 128 ||
		reference.some(
			(row) =>
				row.length !== CHANNELS || row.some((id) => !Number.isInteger(id) || id < 0 || id >= VOCAB),
		)
	)
		throw new Error("Invalid reference audio codes.");
	// Upstream issue #198: legacy encoder padding must not condition generation.
	if (reference.length > 1 && reference.at(-1)![0] === 455) reference.pop();
	const [pre, decode, acoustic, codec] = await Promise.all([
		onnxSession(BASE, "vieneu_prefill.onnx", requestId, reply, {
			path: "vieneu_backbone_shared.data",
			data: shared,
		}),
		onnxSession(BASE, "vieneu_decode_step.onnx", requestId, reply, {
			path: "vieneu_backbone_shared.data",
			data: shared,
		}),
		onnxSession(BASE, "vieneu_acoustic_cached.onnx", requestId, reply),
		onnxSession(CODEC, "moss_audio_tokenizer_decode_full.onnx", requestId, reply, {
			path: "moss_audio_tokenizer_decode_shared.data",
			data: codecShared,
		}),
	]);
	return {
		pre,
		decode,
		acoustic,
		codec,
		text: head("text_emb", [419, HIDDEN]),
		audio: head("audio_emb", [CHANNELS, VOCAB, HIDDEN]),
		anchor,
		reference,
		config,
		tokenize: vieneuTokenizer(json(tokenizerBytes)),
		g2p,
	};
}
function embed(model: Model, textIds: number[], audioCodes?: readonly number[][]) {
	const result = new Float32Array(textIds.length * HIDDEN);
	for (let row = 0; row < textIds.length; row++) {
		if (textIds[row] < 0 || textIds[row] >= 419) throw new Error("Invalid text token.");
		result.set(
			model.text.subarray(textIds[row] * HIDDEN, (textIds[row] + 1) * HIDDEN),
			row * HIDDEN,
		);
		const codes = audioCodes?.[row];
		if (codes)
			for (let ch = 0; ch < CHANNELS; ch++) {
				const offset = (ch * VOCAB + codes[ch]) * HIDDEN;
				for (let i = 0; i < HIDDEN; i++) result[row * HIDDEN + i] += model.audio[offset + i];
			}
		for (let i = 0; i < HIDDEN; i++) result[row * HIDDEN + i] += model.anchor[i];
	}
	return result;
}
function pcm(tensor: Tensor | undefined) {
	if (!(tensor?.data instanceof Float32Array)) throw new Error("Invalid VieNeu output tensor.");
	return tensor.data;
}
function positions(...values: number[]) {
	return new Tensor("int64", BigInt64Array.from(values, BigInt), [1, values.length]);
}
function past(outputs: Record<string, Tensor>, layers: number): Record<string, Tensor> {
	const feeds: Record<string, Tensor> = {};
	for (let i = 0; i < layers; i++) {
		feeds[`past_k_${i}`] = outputs[`present_k_${i}`];
		feeds[`past_v_${i}`] = outputs[`present_v_${i}`];
	}
	return feeds;
}

async function acousticFrame(model: Model, hidden: Float32Array, history: number[][]) {
	const { config } = model;
	const first = new Float32Array(HIDDEN * 2);
	first.set(hidden);
	first.set(
		model.text.subarray(
			config.speech_generation_start_token_id * HIDDEN,
			(config.speech_generation_start_token_id + 1) * HIDDEN,
		),
		HIDDEN,
	);
	let output = await model.acoustic.run({
		token_emb: new Tensor("float32", first, [1, 2, HIDDEN]),
		position_ids: positions(0, 1),
		past_k_0: new Tensor("float32", new Float32Array(), [1, 8, 0, 96]),
		past_v_0: new Tensor("float32", new Float32Array(), [1, 8, 0, 96]),
	});
	const slot = pcm(output.hidden).slice(0, HIDDEN);
	const codes: number[] = [];
	for (let channel = 0; channel < CHANNELS; channel++) {
		const local = pcm(output.hidden).slice(-HIDDEN);
		const code = sample(
			project(local, model.audio, VOCAB, channel * VOCAB * HIDDEN),
			history[channel],
		);
		codes.push(code);
		history[channel].push(code);
		if (history[channel].length > 64) history[channel].shift();
		if (channel + 1 < CHANNELS) {
			const offset = (channel * VOCAB + code) * HIDDEN;
			// oxlint-disable-next-line no-await-in-loop -- Each codebook conditions the next acoustic step.
			output = await model.acoustic.run({
				token_emb: new Tensor("float32", model.audio.slice(offset, offset + HIDDEN), [
					1,
					1,
					HIDDEN,
				]),
				position_ids: positions(channel + 2),
				...past(output, 1),
			});
		}
	}
	return {
		codes,
		eos: argmax(project(slot, model.text, 419)) === config.speech_generation_end_token_id,
	};
}
async function synthesize(model: Model, text: string) {
	const phones = model.g2p.phonemize(text);
	const { config } = model;
	const ids = [
		config.default_style_token_id,
		config.text_prompt_start_token_id,
		...model.tokenize(phones),
		config.text_prompt_end_token_id,
	];
	const prompt = embed(model, ids);
	const refs = embed(
		model,
		model.reference.map(() => config.audio_ref_slot_token_id),
		model.reference,
	);
	const embeddings = new Float32Array(prompt.length + refs.length);
	embeddings.set(prompt);
	embeddings.set(refs, prompt.length);
	const length = ids.length + model.reference.length;
	if (length >= 800) throw new Error("VieNeu prompt exceeds the context limit.");
	let output = await model.pre.run({
		inputs_embeds: new Tensor("float32", embeddings, [1, length, HIDDEN]),
	});
	let hidden = pcm(output.hidden).slice(-HIDDEN);
	const history = Array.from({ length: CHANNELS }, () => [] as number[]);
	const frames: number[][] = [];
	const limit = maxFrames(phones);
	for (let frame = 0; frame < limit; frame++) {
		// oxlint-disable-next-line no-await-in-loop -- Autoregressive frames consume the previous hidden state.
		const next = await acousticFrame(model, hidden, history);
		frames.push(next.codes);
		if (next.eos) break;
		const input = embed(model, [config.speech_generation_start_token_id], [next.codes]);
		// oxlint-disable-next-line no-await-in-loop -- KV caches must be updated sequentially.
		output = await model.decode.run({
			inputs_embeds: new Tensor("float32", input, [1, 1, HIDDEN]),
			position_ids: positions(length + frame),
			...past(output, LAYERS),
		});
		hidden = pcm(output.hidden).slice(-HIDDEN);
	}
	const decoded = await model.codec.run({
		audio_codes: new Tensor("int32", Int32Array.from(frames.flat()), [1, frames.length, CHANNELS]),
		audio_code_lengths: new Tensor("int32", Int32Array.of(frames.length), [1]),
	});
	const audio = pcm(decoded.audio);
	const samples = Number(decoded.audio_lengths?.data[0]);
	if (!Number.isInteger(samples) || samples <= 0 || samples * 2 > audio.length)
		throw new Error("Invalid codec audio length.");
	const mono = new Float32Array(samples);
	const stride = decoded.audio.dims.at(-1)!;
	for (let i = 0; i < samples; i++) mono[i] = (audio[i] + audio[stride + i]) / 2;
	return mono;
}
synthesisWorker(
	async (request) => {
		const voice = findLocalModel("tts", request.model);
		if (!voice || voice.engine !== "vieneu" || request.type === "transcribe")
			throw new Error("Unknown VieNeu voice.");
		loadedModel ??= await load(voice.voiceId, request.requestId);
		const model = loadedModel;
		if (request.type === "load") {
			reply({ requestId: request.requestId, type: "ready" });
			return;
		}
		reply({ requestId: request.requestId, type: "working" });
		const chunks: Float32Array[] = [];
		for (const text of splitSpeechText(model.g2p.normalize(request.text), 180)) {
			// oxlint-disable-next-line no-await-in-loop -- Chunks share the generation sessions.
			chunks.push(await synthesize(model, text));
		}
		reply({
			requestId: request.requestId,
			type: "audio",
			audio: pcmToWav(mergeAudio(chunks), 48_000),
		});
	},
	reply,
	"VieNeu",
);
