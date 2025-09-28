import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pronunciation/tones/creaky-rising")({
	component: CreakyRisingToneComponent,
});

function CreakyRisingToneComponent() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-burgundy-dark to-burgundy">
			<div className="px-6 pb-8">
				<div className="mx-auto max-w-md space-y-6">
					<h1 className="text-center font-bold text-2xl text-white">
						Creaky Rising Tone (Ngã)
					</h1>
					<p className="text-center text-white">
						Route placeholder - to be implemented
					</p>
				</div>
			</div>
		</div>
	);
}
