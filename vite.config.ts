import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart({ rsc: { enabled: true } }),
		rsc(),
		nitro(),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	],
	worker: {
		format: "es",
	},
	optimizeDeps: {
		exclude: [
			"onnxruntime-web",
			"@huggingface/transformers",
			"@mlc-ai/web-llm",
		],
	},
	resolve: { tsconfigPaths: true },
	// Cross-Origin Isolation headers are required for SharedArrayBuffer, which ONNX Runtime
	// uses for multi-threaded WASM inference. Applied in both dev and production so that
	// numThreads > 1 actually takes effect during development as well.
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
	preview: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
});

export default config;
