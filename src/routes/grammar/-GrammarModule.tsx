import { Disclosure } from "~/components/Disclosure";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { type WordData, WordGrid } from "./-WordGrid";

export interface GrammarSectionData {
	id: string;
	title: string;
	description: string;
	colorKey: string;
	words: Record<string, WordData>;
	examples: Example[];
}

export interface GrammarModuleData {
	introduction: {
		title: string;
		content: string[];
	};
	sections: GrammarSectionData[];
}

/**
 * Standard layout for a grammar module:
 * - Introduction Disclosure (theory)
 * - Sections, each with: heading, WordGrid (essential words), collapsible Examples
 */
export function GrammarModule({ data }: { data: GrammarModuleData }) {
	return (
		<div className="space-y-8">
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

			{data.sections.map((section) => (
				<div key={section.id} className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{section.title}
						</h2>
						<p className="mt-1 text-white/60">{section.description}</p>
					</div>

					{Object.keys(section.words).length > 0 && (
						<WordGrid
							data={section.words}
							titleClassName={GRAMMAR_TYPE_COLORS[section.colorKey]}
						/>
					)}

					{section.examples.length > 0 && (
						<Disclosure plain title="Examples" defaultOpen>
							<GrammarPracticeGrid examples={section.examples} />
						</Disclosure>
					)}
				</div>
			))}
		</div>
	);
}
