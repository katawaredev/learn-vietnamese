import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

// Plugins from the app's vite.config.ts that don't belong in Storybook.
// RSC, TanStack Start, Nitro, the devtools panel, and the duplicate React
// plugin (Storybook's @storybook/react-vite already provides React) all break
// the browser-only Storybook preview iframe with either "react-server condition"
// errors or RefreshRuntime redeclarations.
const EXCLUDED_PLUGIN_TOKENS = [
	"rsc",
	"nitro",
	"tanstack-start",
	"@tanstack/start",
	"tanstack-devtools",
	"@tanstack/devtools",
	"vite:react", // duplicate of Storybook's React plugin
	"vite:react-babel",
	"vite:react-refresh",
];

function shouldExclude(plugin: unknown): boolean {
	if (!plugin || typeof plugin !== "object") return false;
	const name = (plugin as { name?: string }).name;
	if (typeof name !== "string") return false;
	return EXCLUDED_PLUGIN_TOKENS.some((token) => name.includes(token));
}

const config: StorybookConfig = {
	stories: ["../src/components/**/*.stories.@(ts|tsx)"],
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
		"@github-ui/storybook-addon-performance-panel",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	typescript: {
		reactDocgen: "react-docgen-typescript",
	},
	async viteFinal(viteConfig) {
		const filteredPlugins = (viteConfig.plugins ?? []).filter((plugin) => {
			if (Array.isArray(plugin)) return !plugin.some(shouldExclude);
			return !shouldExclude(plugin);
		});

		// Tailwind v4 uses a Vite plugin; keep it so component styles render.
		return {
			...viteConfig,
			plugins: [...filteredPlugins, tailwindcss()],
		};
	},
};

export default config;
