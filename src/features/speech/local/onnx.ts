import { env, InferenceSession } from "onnxruntime-web/wasm";
import ortWasm from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import { modelFile, type Reply } from "./download";

env.wasm.numThreads = 1;
env.wasm.proxy = false;
env.wasm.wasmPaths = { wasm: new URL(ortWasm, self.location.href).href };

let creations = Promise.resolve();
export async function onnxSession(
	base: string,
	file: string,
	requestId: string,
	reply: Reply,
	external?: { path: string; data: ArrayBuffer },
) {
	const bytes = await modelFile(`${base}/${file}`, requestId, reply);
	// ORT mounts external files in module-global state; concurrent creates overwrite it.
	const created = creations.then(() =>
		InferenceSession.create(bytes, {
			executionProviders: ["wasm"],
			externalData: external ? [external] : undefined,
		}),
	);
	creations = created.then(
		() => {},
		() => {},
	);
	return created;
}
