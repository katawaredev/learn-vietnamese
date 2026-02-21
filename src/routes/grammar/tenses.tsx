import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/tenses.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/lib/grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/tenses")({
	component: TensesComponent,
});

interface WordData {
	meaning: string;
	notes: string[];
}

interface Section {
	id: string;
	title: string;
	description: string;
	markers: Record<string, WordData>;
	examples: Example[];
}

interface TensesData {
	introduction: {
		title: string;
		content: string[];
	};
	sections: Section[];
}

function WordGrid({
	data,
	titleClassName,
}: {
	data: Record<string, WordData>;
	titleClassName?: string;
}) {
	return (
		<PracticeGrid<WordData>
			data={data}
			titleClassName={titleClassName}
			getSubtitle={(item) => item.meaning}
			getDetails={(_word, item) => ({
				Notes: (
					<ul className="mt-1 ml-4 list-disc space-y-1 text-sm text-white/70">
						{item.notes.map((note) => (
							<li key={note.slice(0, 30)}>{note}</li>
						))}
					</ul>
				),
			})}
			size="medium"
		/>
	);
}

function TensesComponent() {
	const data = dataFile as unknown as TensesData;

	return (
		<Layout>
			<div className="space-y-8">
				{/* Introduction */}
				<Disclosure
					defaultOpen
					title={
						<span className="font-bold text-lg">{data.introduction.title}</span>
					}
				>
					<div className="space-y-4">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Tense Marker Sections */}
				{data.sections.map((section) => (
					<div key={section.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{section.title}
							</h2>
							<p className="mt-1 text-white/60">{section.description}</p>
						</div>

						<WordGrid
							data={section.markers}
							titleClassName={GRAMMAR_TYPE_COLORS["tense-marker"]}
						/>

						{section.examples.length > 0 && (
							<Disclosure plain title="Examples" defaultOpen>
								<GrammarPracticeGrid examples={section.examples} />
							</Disclosure>
						)}
					</div>
				))}
			</div>
		</Layout>
	);
}
