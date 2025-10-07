import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/relations/")({
	beforeLoad: () => {
		throw redirect({
			to: "/relations/pronouns",
		});
	},
});
