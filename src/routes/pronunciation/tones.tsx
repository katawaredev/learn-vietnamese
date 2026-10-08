import { createFileRoute } from "@tanstack/react-router";
import { Callout } from "~/components/Callout";
import { Disclosure } from "~/components/Disclosure";
import { Markdown } from "~/components/Markdown";
import tones from "~/data/pronunciation/tones.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

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
					<span className="text-lg font-bold">{name}</span>
					<span className="font-mono">{direction}</span>
				</>
			}
		>
			<div className="space-y-3">
				{description && (
					<div>
						<strong className="text-gold">Description:</strong>
						<Markdown className="ml-2" text={description} />
					</div>
				)}
				{pronunciation && (
					<div>
						<strong className="text-gold">Pronunciation:</strong>
						<Markdown className="ml-2" text={pronunciation} />
					</div>
				)}
				{analogy && (
					<div>
						<strong className="text-gold">Analogy:</strong>
						<Markdown className="ml-2" text={analogy} />
					</div>
				)}
				{notes && (
					<div>
						<strong className="text-gold">Notes:</strong>
						<Markdown className="ml-2" text={notes} />
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
		<Layout>
			<Callout variant="note" dismissible className="mb-6">
				The example syllables below are for <em>tonal pronunciation practice</em>, not vocabulary.
				The point is to hear and produce the same syllable across all six tones — so some entries
				are rare, archaic, or dialectal. That's intentional. Focus on the pitch contour, not the
				gloss.
			</Callout>
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
							notes={"notes" in item ? item.notes : undefined}
						/>
						<PracticeGrid<ToneExampleData>
							data={item.examples}
							getSubtitle={(example) => example.translation || ""}
						/>
					</div>
				))}
			</div>
		</Layout>
	);
}
