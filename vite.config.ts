import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	server: {
		open: true,
		port: 3000,
	},
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths(),
		tanstackStart({
			customViteReactPlugin: true,
		}),
		viteReact(),
		tailwindcss(),
	],
});

export default config;
