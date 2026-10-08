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
	"storybook-static/",
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
		// Type checking needs the full project, including ambient Vite declarations.
		"*": () => "vp check --fix",
	},
	lint: {
		categories: {
			correctness: "error",
			suspicious: "warn",
			perf: "warn",
			pedantic: "off",
			// Oxfmt owns formatting; opt into useful rules outside correctness below.
			style: "off",
			restriction: "off",
			nursery: "off",
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
			reportUnusedDisableDirectives: "error",
			maxWarnings: 0,
		},

		plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "jsx-a11y"],

		rules: {
			"vite-plus/prefer-vite-plus-imports": "error",
			"typescript/no-deprecated": "warn",
			"typescript/ban-ts-comment": "error",
			"typescript/no-array-constructor": "error",
			"typescript/no-misused-promises": "error",
			"typescript/no-namespace": "error",
			"typescript/no-require-imports": "error",
			"typescript/no-explicit-any": "error",
			"typescript/no-empty-object-type": "error",
			"typescript/no-non-null-asserted-optional-chain": "error",
			"typescript/no-unnecessary-type-assertion": "error",
			"typescript/no-unnecessary-type-constraint": "error",
			"typescript/no-unsafe-argument": "error",
			"typescript/no-unsafe-assignment": "error",
			"typescript/no-unsafe-call": "error",
			"typescript/no-unsafe-enum-comparison": "error",
			"typescript/no-unsafe-function-type": "error",
			"typescript/no-unsafe-member-access": "error",
			"typescript/no-unsafe-return": "error",
			"typescript/no-wrapper-object-types": "error",
			"typescript/only-throw-error": [
				"error",
				{ allow: [{ from: "package", package: "@tanstack/router-core", name: "Redirect" }] },
			],
			"typescript/prefer-as-const": "error",
			"typescript/prefer-promise-reject-errors": "error",
			"typescript/require-await": "error",
			"typescript/restrict-plus-operands": "error",
			"eslint/eqeqeq": ["error", "always", { null: "ignore" }],
			"eslint/array-callback-return": "error",
			"eslint/no-var": "error",
			"eslint/prefer-const": "error",
			// ESLint recommended rules not enabled as errors by these Oxlint categories.
			"eslint/no-case-declarations": "error",
			"eslint/no-empty": ["error", { allowEmptyCatch: true }],
			"eslint/no-fallthrough": "error",
			"eslint/no-prototype-builtins": "error",
			"eslint/no-redeclare": "error",
			"eslint/no-regex-spaces": "error",
			"eslint/no-undef": "error",
			"eslint/no-unexpected-multiline": "error",
			"eslint/no-useless-assignment": "error",
			"eslint/preserve-caught-error": "error",
			// Oxlint categories differ from ESLint's recommended presets.
			"react/rules-of-hooks": "error",
			"react/exhaustive-deps": "error",
			"react/react-compiler": "warn",
			"react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
			// Assertions from unknown still need review, but are not unsafe any usage.
			"typescript/no-unsafe-type-assertion": "off",
			// Naming and function placement are conventions, not suspicious behavior.
			"eslint/no-underscore-dangle": "off",
			"unicorn/consistent-function-scoping": "off",
			"unicorn/prefer-add-event-listener": "off",
			"unicorn/no-array-sort": "off",
			// This syntax-only rule mistakes Worker.postMessage for Window.postMessage.
			"unicorn/require-post-message-target-origin": "off",

			...betterTailwindcss.configs.correctness.rules,
			"better-tailwindcss/no-deprecated-classes": "warn",
			"better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^dark$"] }],

			...pluginRouter.configs["flat/recommended"][0].rules,
			"react/react-in-jsx-scope": "off",
		},
		overrides: [
			{
				files: ["**/*.{ts,tsx,mts,cts}"],
				// TypeScript checks names and understands type-only globals.
				rules: { "eslint/no-undef": "off" },
			},
		],

		settings: {
			"better-tailwindcss": {
				entryPoint: "src/styles.css",
			},
		},
	},
	fmt: {
		ignorePatterns: [...ignorePatterns, "pnpm-lock.yaml"],
		useTabs: true,
		tabWidth: 2,
		endOfLine: "lf",
		singleQuote: false,
		semi: true,
		sortTailwindcss: {
			stylesheet: "./src/styles.css",
			functions: ["cva", "cx", "twMerge", "clsx", "cn"],
		},
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
