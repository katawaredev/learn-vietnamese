import { createFileRoute } from "@tanstack/react-router";
import { Telex } from "~/components/Telex";
import consonantsData from "~/data/pronunciation/consonants.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/consonants")({
	component: ConsonantsComponent,
});

interface ConsonantData {
	pronunciation?: string;
	ipa?: string;
	telex?: string;
}

function ConsonantsComponent() {
	return (
		<PronunciationLayout currentRoute="consonants">
			<PracticeGrid<ConsonantData>
				data={consonantsData}
				getSubtitle={(item) => item.ipa || ""}
				getDetails={(name, item) => {
					const details: Record<string, React.ReactNode> = {
						Name: (
							<>
								{name}
								{item.ipa && <code className="ml-2">{item.ipa}</code>}
							</>
						),
					};
					if (item.pronunciation) {
						details.Pronunciation = item.pronunciation;
					}
					if (item.telex) {
						details.Telex = <Telex text={item.telex} />;
					}
					return Object.keys(details).length > 0 ? details : undefined;
				}}
			/>
		</PronunciationLayout>
	);
}
