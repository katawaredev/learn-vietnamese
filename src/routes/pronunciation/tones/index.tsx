import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pronunciation/tones/")({
	beforeLoad: () => {
		throw redirect({
			to: "/pronunciation/tones/flat",
		});
	},
});
