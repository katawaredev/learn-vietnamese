import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pronunciation/")({
	beforeLoad: () => {
		throw redirect({
			to: "/pronunciation/vowels",
		});
	},
});
