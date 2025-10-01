import { createFileRoute } from "@tanstack/react-router";
import { Telex } from "~/components/Telex";
import doubleVowelsData from "~/data/pronunciation/double-vowels.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/double-vowels")({
	component: DoubleVowelsComponent,
});

interface DoubleVowelData {
	pronunciation?: string;
	ipa?: string;
	telex?: string;
}

function DoubleVowelsComponent() {
	return (
		<PronunciationLayout currentRoute="double-vowels">
			<PracticeGrid<DoubleVowelData>
				data={doubleVowelsData}
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
