import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/numbers/")({
	beforeLoad: () => {
		throw redirect({
			to: "/numbers/counting",
		});
	},
});
