import { MAX_AUDIO_BYTES } from "../contracts";
import { Schema } from "effect";
import { LocalRequest } from "./protocol";
import type { Reply } from "./download";

export function splitSpeechText(text: string, limit = 180) {
	const sentences = text.trim().match(/[^.!?…]+[.!?…]*|[.!?…]+/gu) ?? [];
	const chunks: string[] = [];
	for (const sentence of sentences) {
		let chunk = "";
		for (const word of sentence.trim().split(/\s+/)) {
			if (chunk && chunk.length + word.length + 1 > limit) {
				chunks.push(chunk);
				chunk = "";
			}
			chunk += (chunk ? " " : "") + word;
		}
		if (chunk) chunks.push(chunk);
	}
	return chunks;
}
export function mergeAudio(chunks: readonly Float32Array[], overlap = 0) {
	let merged = new Float32Array();
	for (const chunk of chunks) {
		const fade = Math.min(overlap, merged.length, chunk.length);
		const length = merged.length + chunk.length - fade;
		if (length * 2 + 44 > MAX_AUDIO_BYTES)
			throw new Error("Generated audio exceeds the audio limit.");
		const next = new Float32Array(length);
		next.set(merged);
		next.set(chunk, merged.length - fade);
		for (let i = 0; i < fade; i++) {
			const weight = (i + 1) / (fade + 1);
			next[merged.length - fade + i] =
				merged[merged.length - fade + i] * (1 - weight) + chunk[i] * weight;
		}
		merged = next;
	}
	if (!merged.length || !merged.every(Number.isFinite)) throw new Error("Invalid generated audio.");
	return merged;
}
export function synthesisWorker(
	handle: (request: LocalRequest) => Promise<void>,
	reply: Reply,
	engine: string,
) {
	let queue = Promise.resolve();
	self.addEventListener("message", (event: MessageEvent<unknown>) => {
		queue = queue
			.then(async () => {
				const request = Schema.decodeUnknownSync(LocalRequest)(event.data);
				try {
					await handle(request);
				} catch (error) {
					console.error(`Local ${engine} model failed`, error);
					reply({
						requestId: request.requestId,
						type: "error",
						message: `${engine} failed to load or run. Check your connection and available memory, or choose another voice.`,
					});
				}
			})
			.catch(() => {});
	});
}
