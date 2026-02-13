import { env } from "@huggingface/transformers";

// Shared configuration for all transformers.js workers
// Disable local models to ensure models are always fetched from HuggingFace
env.allowLocalModels = false;

// Use all available CPU threads for WASM ONNX inference.
// Falls back to 1 if hardwareConcurrency is unavailable (e.g., some mobile browsers).
// Requires Cross-Origin-Embedder-Policy + Cross-Origin-Opener-Policy headers
// (set in vite.config.ts) for SharedArrayBuffer access.
if (env.backends.onnx.wasm) {
	env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 1;
}

export { env };
