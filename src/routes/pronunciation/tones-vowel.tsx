import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import tones from "~/data/pronunciation/tones.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/tones-vowel")({
	component: TonesVowelsComponent,
});

interface ToneExampleData {
	translation?: string;
}

function TonesVowelsComponent() {
	const toneKeys = Object.keys(tones) as Array<keyof typeof tones>;

	// Convert each tone's examples to an array
	const examplesArrays = toneKeys.map((key) =>
		Object.entries(tones[key].examples),
	);

	// Get the max number of examples
	const maxExamples = Math.max(...examplesArrays.map((arr) => arr.length));

	// Group by position: collect nth example from each tone
	const groupedByPosition = Array.from({ length: maxExamples }, (_, i) => {
		const group: Record<string, ToneExampleData> = {};
		examplesArrays.forEach((examples) => {
			if (examples[i]) {
				const [word, data] = examples[i];
				group[word] = data;
			}
		});
		return group;
	});

	return (
		<PronunciationLayout currentRoute="tones-vowel">
			<div className="space-y-6">
				{groupedByPosition.map((group, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: No key
					<Fragment key={index}>
						{index !== 0 && <hr className="my-8" />}
						<PracticeGrid<ToneExampleData>
							data={group}
							getSubtitle={(item) => item.translation || ""}
						/>
					</Fragment>
				))}
			</div>
		</PronunciationLayout>
	);
}
