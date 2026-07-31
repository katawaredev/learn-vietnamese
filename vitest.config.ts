import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

const { dirname } = import.meta;

export default defineConfig({
	test: {
		projects: [
			{
				extends: true,
				test: {
					environment: "jsdom",
					include: ["src/**/*.test.{ts,tsx}"],
					name: "unit",
				},
			},
			{
				extends: true,
				plugins: [
					storybookTest({
						configDir: path.join(dirname, ".storybook"),
					}),
				],
				resolve: {
					alias: {
						"~": path.join(dirname, "src"),
					},
				},
				test: {
					browser: {
						enabled: true,
						headless: true,
						instances: [{ browser: "chromium" }],
						provider: playwright(),
					},
					name: "storybook",
				},
			},
		],
	},
});
