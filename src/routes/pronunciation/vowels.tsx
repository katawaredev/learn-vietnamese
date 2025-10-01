import { createFileRoute } from "@tanstack/react-router";
import { Telex } from "~/components/Telex";
import vowelsData from "~/data/pronunciation/vowels.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/vowels")({
	component: VowelsComponent,
});

interface VowelData {
	pronunciation?: string;
	ipa?: string;
	telex?: string;
}

function VowelsComponent() {
	return (
		<PronunciationLayout currentRoute="vowels">
			<PracticeGrid<VowelData>
				data={vowelsData}
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
