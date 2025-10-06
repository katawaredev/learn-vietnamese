import { createFileRoute } from "@tanstack/react-router";
import { Telex } from "~/components/Telex";
import vowelsData from "~/data/pronunciation/vowels.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

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
		<Layout>
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
		</Layout>
	);
}
