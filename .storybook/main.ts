import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
		"@github-ui/storybook-addon-performance-panel",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {
			builder: {
				viteConfigPath: fileURLToPath(new URL("./vite.config.ts", import.meta.url)),
			},
		},
	},
	stories: ["../src/components/**/*.stories.@(ts|tsx)"],
	typescript: {
		reactDocgen: "react-docgen-typescript",
	},
};

export default config;
