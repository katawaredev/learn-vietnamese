declare module "@diffusionstudio/piper-wasm" {
	interface PiperModule {
		callMain: (args: string[]) => number;
	}
	interface PiperOptions {
		print: (line: string) => void;
		printErr: (line: string) => void;
		locateFile: (file: string) => string;
	}
	export default function createPiperPhonemize(options: PiperOptions): Promise<PiperModule>;
}
