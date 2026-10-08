import addonPerformancePanel from "@github-ui/storybook-addon-performance-panel";
import addonA11y from "@storybook/addon-a11y";
import type { Decorator } from "@storybook/react-vite";
import { definePreview } from "@storybook/react-vite";
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from "@tanstack/react-router";
import { useMemo } from "react";
import { STTProvider } from "../src/providers/stt-provider";
import { UIProvider } from "../src/providers/ui-provider";
import "../src/styles.css";

const withRouter: Decorator = function RouterDecorator(Story) {
	const router = useMemo(() => {
		const rootRoute = createRootRoute({ component: () => <Story /> });
		return createRouter({
			history: createMemoryHistory({ initialEntries: ["/"] }),
			routeTree: rootRoute,
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
	decorators: [withTheme, withProviders, withRouter],
	parameters: {
		a11y: {
			options: { xpath: true },
		},
		backgrounds: { disable: true },
		docs: { toc: true },
		layout: "padded",
	},
});
