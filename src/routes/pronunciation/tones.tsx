import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import tones from "~/data/pronunciation/tones.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { PronunciationLayout } from "~/layout/PronunciationLayout";

export const Route = createFileRoute("/pronunciation/tones")({
	component: TonesComponent,
});

interface ToneDisclosureProps {
	name: string;
	direction: string;
	ipa?: string;
	description?: string;
	pronunciation?: string;
	telex?: string;
	analogy?: string;
	notes?: string;
}

function ToneDisclosure({
	name,
	direction,
	ipa,
	description,
	pronunciation,
	telex,
	analogy,
	notes,
}: ToneDisclosureProps) {
	return (
		<Disclosure
			title={
				<>
					<span className="font-bold text-gold text-lg">{name}</span>
					<span className="font-mono">{direction}</span>
				</>
			}
		>
			<div className="space-y-3">
				{description && (
					<div>
						<strong className="text-gold">Description:</strong>
						<span className="ml-2">{description}</span>
					</div>
				)}
				{pronunciation && (
					<div>
						<strong className="text-gold">Pronunciation:</strong>
						<span className="ml-2">{pronunciation}</span>
					</div>
				)}
				{analogy && (
					<div>
						<strong className="text-gold">Analogy:</strong>
						<span className="ml-2">{analogy}</span>
					</div>
				)}
				{notes && (
					<div>
						<strong className="text-gold">Notes:</strong>
						<span className="ml-2">{notes}</span>
					</div>
				)}
				{ipa && (
					<div>
						<strong className="text-gold">IPA:</strong>
						<code className="ml-2">{ipa}</code>
					</div>
				)}
				{telex && (
					<div>
						<strong className="text-gold">Telex:</strong>
						<code className="ml-2">{telex}</code>
					</div>
				)}
			</div>
		</Disclosure>
	);
}

interface ToneExampleData {
	translation?: string;
}

function TonesComponent() {
	return (
		<PronunciationLayout currentRoute="tones">
			<div className="space-y-6">
				{Object.entries(tones).map(([key, item]) => (
					<div key={key} className="space-y-4">
						<ToneDisclosure
							name={item.name}
							direction={item.direction}
							ipa={item.ipa}
							description={item.description}
							pronunciation={item.pronunciation}
							telex={item.telex}
							analogy={item.analogy}
							notes={"notes" in item ? (item.notes as string) : undefined}
						/>
						<PracticeGrid<ToneExampleData>
							data={item.examples}
							getSubtitle={(item) => item.translation || ""}
						/>
					</div>
				))}
			</div>
		</PronunciationLayout>
	);
}
