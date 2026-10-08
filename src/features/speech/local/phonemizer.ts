import phonemizerWasm from "./assets/sea-g2p.wasm?url";
import { modelFile, type Reply } from "./download";

export const SEA_REVISION = "e825173f235d08ea19315b2b279fb11153b44cea";
interface SeaExports {
	memory: WebAssembly.Memory;
	sea_alloc: (length: number) => number;
	sea_free: (pointer: number, length: number) => void;
	sea_init: (pointer: number, length: number) => number;
	sea_g2p_phonemize: (handle: number, pointer: number, punctuation: number) => number;
	sea_g2p_normalize: (handle: number, pointer: number, punctuation: number) => number;
	sea_g2p_string_free: (pointer: number) => void;
}
export class Phonemizer {
	private constructor(
		private readonly wasm: SeaExports,
		private readonly handle: number,
	) {}
	static async create(requestId: string, reply: Reply) {
		const [binary, dictionary] = await Promise.all([
			modelFile(
				new URL(phonemizerWasm, self.location.href).href,
				requestId,
				reply,
				16 * 1024 * 1024,
			),
			modelFile(
				`https://raw.githubusercontent.com/pnnbao97/sea-g2p/${SEA_REVISION}/python/sea_g2p/sea_g2p.bin`,
				requestId,
				reply,
				64 * 1024 * 1024,
			),
		]);
		const { instance } = await WebAssembly.instantiate(binary, {});
		const wasm = instance.exports as unknown as SeaExports;
		const pointer = wasm.sea_alloc(dictionary.byteLength);
		new Uint8Array(wasm.memory.buffer, pointer, dictionary.byteLength).set(
			new Uint8Array(dictionary),
		);
		const handle = wasm.sea_init(pointer, dictionary.byteLength);
		if (!handle) throw new Error("Could not initialize Vietnamese pronunciation dictionary.");
		return new Phonemizer(wasm, handle);
	}
	private run(text: string, normalize: boolean, punctuation: boolean) {
		if (text.includes("\0")) throw new Error("Speech text contains a NUL character.");
		const input = new TextEncoder().encode(text + "\0");
		const pointer = this.wasm.sea_alloc(input.length);
		let output = 0;
		try {
			new Uint8Array(this.wasm.memory.buffer, pointer, input.length).set(input);
			const call = normalize ? this.wasm.sea_g2p_normalize : this.wasm.sea_g2p_phonemize;
			output = call(this.handle, pointer, Number(punctuation));
			if (!output) throw new Error("Vietnamese phonemization failed.");
			const memory = new Uint8Array(this.wasm.memory.buffer);
			let end = output;
			while (end < Math.min(memory.length, output + 262_144) && memory[end]) end++;
			if (memory[end] !== 0) throw new Error("Invalid phonemizer output.");
			return new TextDecoder().decode(memory.subarray(output, end));
		} finally {
			this.wasm.sea_free(pointer, input.length);
			if (output) this.wasm.sea_g2p_string_free(output);
		}
	}
	phonemize(text: string, punctuation = true) {
		return this.run(text, false, punctuation);
	}
	normalize(text: string, punctuation = false) {
		return this.run(text, true, punctuation);
	}
}
