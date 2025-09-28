import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pronunciation/tones/dipping-rising")({
	component: DippingRisingToneComponent,
});

function DippingRisingToneComponent() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-burgundy-dark to-burgundy">
			<div className="px-6 pb-8">
				<div className="mx-auto max-w-md space-y-6">
					<h1 className="text-center font-bold text-2xl text-white">
						Dipping-Rising Tone (Hỏi)
					</h1>
					<p className="text-center text-white">
						Route placeholder - to be implemented
					</p>
				</div>
			</div>
		</div>
	);
}
