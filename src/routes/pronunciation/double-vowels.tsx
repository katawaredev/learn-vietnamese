import { createFileRoute } from "@tanstack/react-router";
import doubleVowelsData from "~/data/pronunciation/double-vowels.json";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/double-vowels")({
	component: DoubleVowelsComponent,
});

function DoubleVowelsComponent() {
	return (
		<PronunciationLayout data={doubleVowelsData} currentRoute="double-vowels" />
	);
}
