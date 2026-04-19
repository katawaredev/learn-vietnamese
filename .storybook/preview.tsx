import addonPerformancePanel from "@github-ui/storybook-addon-performance-panel";
import addonA11y from "@storybook/addon-a11y";
import type { Decorator } from "@storybook/react-vite";
import { definePreview } from "@storybook/react-vite";
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { useMemo } from "react";
import { STTProvider } from "../src/providers/stt-provider";
import { UIProvider } from "../src/providers/ui-provider";
import "../src/styles.css";

const withRouter: Decorator = (Story) => {
	const router = useMemo(() => {
		const rootRoute = createRootRoute({ component: () => <Story /> });
		return createRouter({
			routeTree: rootRoute,
			history: createMemoryHistory({ initialEntries: ["/"] }),
		});
	}, [Story]);
	return <RouterProvider router={router} />;
};

const withProviders: Decorator = (Story) => (
	<UIProvider>
		<STTProvider>
			<Story />
		</STTProvider>
	</UIProvider>
);

const withTheme: Decorator = (Story) => (
	<div className="min-h-screen">
		<Story />
	</div>
);

export default definePreview({
	addons: [addonPerformancePanel(), addonA11y()],
	parameters: {
		backgrounds: { disable: true },
		layout: "padded",
		docs: { toc: true },
		a11y: {
			options: { xpath: true },
		},
	},
	decorators: [withTheme, withProviders, withRouter],
});
