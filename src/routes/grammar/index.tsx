import { createFileRoute, redirect } from "@tanstack/react-router";

import { grammarRoutes } from "./-layout";

export const Route = createFileRoute("/grammar/")({
	beforeLoad: () => {
		throw redirect({
			to: grammarRoutes[0].path,
		});
	},
});
