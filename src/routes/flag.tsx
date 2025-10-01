import { StarIcon } from "@heroicons/react/24/solid";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flag")({
	component: Flag,
});

function Flag() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="relative aspect-[3/2] w-full max-w-2xl">
				<StarIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 w-4/5 text-gold" />
			</div>
		</div>
	);
}
