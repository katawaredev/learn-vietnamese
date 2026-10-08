import { describe, expect, it } from "vite-plus/test";
import config from "./fixtures/vieneu-tokenizer.json";
import { vieneuTokenizer } from "./vieneu-tokenizer";

const encode = vieneuTokenizer(config);
// Golden IDs from the upstream tokenizer, not from this implementation.
describe("VieNeu's pinned phoneme tokenizer", () => {
	it("matches Vietnamese IPA, combining diacritics and tones", () => {
		expect(encode("sˈin tʃˈaː2w t̪ˈoj ɗˌaːŋ hˈɔ6k t̪ˈiɛɜŋ vˈiɛ6t̪.")).toEqual([
			159, 325, 149, 154, 358, 319, 325, 141, 327, 94, 163, 358, 330, 325, 155, 150, 76, 307, 326,
			141, 327, 303, 347, 325, 306, 98, 151, 358, 330, 325, 149, 310, 311, 303, 360, 325, 149, 310,
			98, 160, 330, 90,
		]);
	});
	it("matches English IPA and preserves special cue tokens", () => {
		expect(encode("həlˈoʊ, ˈaɪ æm lˈɜːnɪŋ vˌiːɛtnəmˈiːz.")).toEqual([
			148, 308, 152, 325, 155, 320, 88, 76, 325, 141, 314, 76, 300, 153, 351, 325, 311, 327, 154,
			314, 303, 360, 326, 149, 327, 310, 160, 154, 308, 153, 325, 149, 327, 166, 90,
		]);
		expect(encode("<|emotion_1|>.")).toEqual([9, 90]);
	});
	it("keeps whitespace and punctuation and normalizes Unicode", () => {
		expect(encode("  tʃˈaː2w?")).toEqual([76, 358, 319, 325, 141, 327, 94, 163, 107]);
		expect(encode("ã")).toEqual(encode("ã"));
	});
});
