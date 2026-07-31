import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import pluginRouter from "@tanstack/eslint-plugin-router";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import rsc from "@vitejs/plugin-rsc";
import { nitro } from "nitro/vite";
import { defineConfig, lazyPlugins } from "vite-plus";

const ignorePatterns = [
	"dist/",
	"node_modules/",
	".turbo/",
	".output/",
	".nitro/",
	".tanstack/",
	".vinxi/",
	"coverage/",
	".pnpm-store/",
	"src/routeTree.gen.ts",
];

const config = defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	lint: {
		categories: {
			correctness: "error",
			suspicious: "warn",
			perf: "warn",

			pedantic: "off",
			style: "warn",
			restriction: "off",

			// Experimental rules, including react/react-compiler.
			nursery: "warn",
		},

		ignorePatterns,

		jsPlugins: [
			{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
			{
				name: "better-tailwindcss",
				specifier: "eslint-plugin-better-tailwindcss",
			},
			{
				name: "@tanstack/router",
				specifier: "@tanstack/eslint-plugin-router",
			},
		],

		options: {
			typeAware: true,
			typeCheck: true,
		},

		plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "jsx-a11y"],

		rules: {
			"vite-plus/prefer-vite-plus-imports": "error",
			"@typescript-eslint/no-deprecated": "warn",

			// Hooks rules are categorized as pedantic, so enable them explicitly.
			"react/rules-of-hooks": "error",

			...betterTailwindcss.configs.recommended.rules,
			"better-tailwindcss/enforce-canonical-classes": ["warn", { rootFontSize: 16 }],
			"better-tailwindcss/enforce-consistent-line-wrapping": "off",
			"better-tailwindcss/no-unknown-classes": ["warn", { ignore: ["^dark$"] }],

			...pluginRouter.configs["flat/recommended"][0].rules,

			// Pedantic
			"unicorn/filename-case": "off", //["warn", { case: "kebabCase" }],
			"react/react-in-jsx-scope": "off",
		},

		settings: {
			"better-tailwindcss": {
				entryPoint: "src/styles.css",
			},
		},
	},
	fmt: {
		ignorePatterns: [...ignorePatterns, "pnpm-lock.yaml"],
	},
	plugins: lazyPlugins(() => [
		devtools(),
		tailwindcss(),
		tanstackStart({ rsc: { enabled: true } }),
		rsc(),
		nitro(),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	]),
	worker: {
		format: "es",
	},
	optimizeDeps: {
		exclude: ["onnxruntime-web", "@huggingface/transformers", "@mlc-ai/web-llm"],
	},
	resolve: { tsconfigPaths: true },
	// Cross-Origin Isolation headers are required for SharedArrayBuffer, which ONNX Runtime
	// Uses for multi-threaded WASM inference. Applied in both dev and production so that
	// NumThreads > 1 actually takes effect during development as well.
	server: {
		headers: {
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
		},
	},
	preview: {
		headers: {
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
		},
	},
});

export default config;
