import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/tenses.json";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { type WordData, WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/tenses")({
	component: TensesComponent,
});

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
