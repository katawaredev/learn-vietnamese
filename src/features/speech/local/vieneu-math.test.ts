import { expect, it } from "vite-plus/test";
import { maxFrames } from "./vieneu-math";

it("bounds short utterances by syllables while preserving multisyllabic English", () => {
	expect(maxFrames("tʃˈaː2w.")).toBe(13);
	expect(maxFrames("sˈin tʃˈaː2w.")).toBe(18);
	expect(maxFrames("kɹiːˈeɪt")).toBe(18);
	expect(maxFrames("nˌoʊtɪfɪkˈeɪʃən")).toBeGreaterThan(28);
});
