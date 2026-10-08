// @vitest-environment node
import { expect, it } from "vite-plus/test";
import { pcmToWav } from "./wav";

it("encodes bounded mono PCM16 with the sample rate and complete RIFF data", async () => {
	const wav = pcmToWav(new Float32Array([-2, -1, 0, 1, 2]), 16_000);
	const buffer = await wav.arrayBuffer();
	const view = new DataView(buffer);
	expect(wav.type).toBe("audio/wav");
	expect(view.getUint16(20, true)).toBe(1);
	expect(view.getUint16(22, true)).toBe(1);
	expect(view.getUint32(24, true)).toBe(16_000);
	expect(view.getUint16(34, true)).toBe(16);
	expect(view.getUint32(4, true)).toBe(buffer.byteLength - 8);
	expect(view.getUint32(40, true)).toBe(10);
	expect(Array.from({ length: 5 }, (_, index) => view.getInt16(44 + index * 2, true))).toEqual([
		-32768, -32768, 0, 32767, 32767,
	]);
});
