import { createFileRoute } from "@tanstack/react-router";
import consonantsData from "~/data/pronunciation/consonants.json";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/consonants")({
	component: ConsonantsComponent,
});

function ConsonantsComponent() {
	return (
		<PronunciationLayout data={consonantsData} currentRoute="consonants" />
	);
}
