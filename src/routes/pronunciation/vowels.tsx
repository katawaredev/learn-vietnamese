import { createFileRoute } from "@tanstack/react-router";
import vowelsData from "~/data/pronunciation/vowels.json";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/vowels")({
	component: VowelsComponent,
});

function VowelsComponent() {
	return <PronunciationLayout data={vowelsData} currentRoute="vowels" />;
}
