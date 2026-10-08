import { describe, expect, it } from "vite-plus/test";
import { phonemesToIds, type PiperConfig } from "./piper-contracts";

const legacy: PiperConfig = {
	audio: { sample_rate: 16_000 },
	espeak: { voice: "vi" },
	inference: { noise_scale: 0.667, length_scale: 1, noise_w: 0.8 },
	phoneme_map: {},
	phoneme_id_map: { "^": [1], _: [0], $: [2], a: [14] },
	num_symbols: 130,
	num_speakers: 1,
};
describe("Piper model vocabulary compatibility", () => {
	it("skips newer tone symbols absent from a legacy voice instead of using out-of-range IDs", () => {
		expect(phonemesToIds(["a", "2"], legacy)).toEqual([1, 0, 14, 0, 2]);
	});
	it("uses custom voice IDs, expansions and padding rather than the phonemizer's global vocabulary", () => {
		const voice = {
			...legacy,
			num_symbols: 256,
			phoneme_map: { x: ["a", "2"] },
			phoneme_id_map: { ...legacy.phoneme_id_map, a: [37], "2": [132] },
		};
		expect(phonemesToIds(["x"], voice)).toEqual([1, 0, 37, 0, 132, 0, 2]);
	});
	it("rejects invalid model symbol maps", () => {
		expect(() => phonemesToIds(["a"], { ...legacy, num_symbols: 10 })).toThrow("Invalid Piper");
	});
});
