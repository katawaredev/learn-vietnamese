import { createRouter as createTanstackRouter } from "@tanstack/react-router";

import NotFound from "~/layout/NotFound";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const createRouter = () => {
	return createTanstackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFound,
	});
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
