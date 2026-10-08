import tailwindcss from "@tailwindcss/vite";
import { defineConfig, lazyPlugins } from "vite-plus";

// Storybook provides React and needs none of the app's server plugins.
export default defineConfig({
	plugins: lazyPlugins(() => [tailwindcss()]),
	resolve: { tsconfigPaths: true },
});
