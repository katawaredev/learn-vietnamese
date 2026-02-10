import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig(({ mode }) => ({
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		nitro(),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	worker: {
		format: "es",
	},
	optimizeDeps: {
		exclude: ["onnxruntime-web", "@huggingface/transformers"],
	},
	// Enable Cross-Origin Isolation in production for ONNX Runtime multi-threading
	preview: {
		headers:
			mode === "production"
				? {
						"Cross-Origin-Opener-Policy": "same-origin",
						"Cross-Origin-Embedder-Policy": "require-corp",
					}
				: {},
	},
}));

export default config;
