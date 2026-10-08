import assert from "node:assert/strict";
import { LOCAL_VOICES } from "../src/features/speech/local/catalog.ts";
import { voicePack } from "../src/features/speech/local/archive.ts";

export async function checkLocalVoiceAssets() {
	const kokoro =
		"https://huggingface.co/contextboxai/Kokoro-Vietnamese/resolve/9f210d622209fcc216fe2ac6159fed2ff381cb8a";
	const vieneu =
		"https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo/resolve/61b85e3d937fbbacb387714180e8182823512523";
	async function file(url: string) {
		const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
		assert(response.ok, `Voice asset unavailable: ${url}`);
		return response;
	}
	for (const voice of LOCAL_VOICES) {
		if (voice.engine === "kokoro") {
			// oxlint-disable-next-line no-await-in-loop -- Bound simultaneous asset allocations.
			const bytes = await (await file(`${kokoro}/voicepacks/${voice.voiceId}.pt`)).arrayBuffer();
			assert.equal(voicePack(bytes).length, 510 * 256);
		} else if (voice.engine === "vieneu") {
			// oxlint-disable-next-line no-await-in-loop -- Preset conditioning is checked one voice at a time.
			const [speaker, codes] = await Promise.all([
				file(`${vieneu}/gguf/voices/${voice.voiceId}/speaker.emb.txt`).then((response) =>
					response.text(),
				),
				file(`${vieneu}/gguf/voices/${voice.voiceId}/ref_codes.txt`).then((response) =>
					response.text(),
				),
			]);
			const embedding = speaker
				.trim()
				.split(/[\s,]+/)
				.map(Number);
			assert.equal(embedding.length, 192, voice.id);
			assert(
				embedding.every(Number.isFinite) && embedding.some((number) => number !== 0),
				voice.id,
			);
			for (const row of codes.trim().split(/\r?\n/)) {
				const frame = row.trim().split(/\s+/).map(Number);
				assert.equal(frame.length, 16, voice.id);
				assert(
					frame.every((number) => Number.isInteger(number) && number >= 0 && number < 1024),
					voice.id,
				);
			}
		}
	}
	console.log("Public preset assets verified for all 14 Kokoro and 25 VieNeu voices.");
}
