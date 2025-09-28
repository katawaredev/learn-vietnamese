import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/pronunciation/tones")({
	component: () => <Outlet />,
});
