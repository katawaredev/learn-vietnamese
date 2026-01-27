import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flag")({
	component: Flag,
});

function Flag() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="relative aspect-3/2 w-full max-w-2xl">
				<svg
					viewBox="0 0 100 88"
					fill="currentColor"
					className="absolute top-1/2 left-1/2 w-4/5 -translate-x-1/2 -translate-y-1/2 text-gold"
					aria-label="Star"
				>
					<title>Star</title>
					<path d="M50 0 L61.8 33.2 L96.6 33.2 L68.4 54.8 L80.2 88 L50 66.4 L19.8 88 L31.6 54.8 L3.4 33.2 L38.2 33.2 Z" />
				</svg>
			</div>
		</div>
	);
}
