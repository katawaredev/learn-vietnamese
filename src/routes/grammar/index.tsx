import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/grammar/")({
	beforeLoad: () => {
		throw redirect({
			to: "/grammar/classifiers",
		});
	},
});
