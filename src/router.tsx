import { createRouter } from "@tanstack/react-router";

import NotFound from "~/layout/NotFound";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFound,
	});
};
