import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import structureData from "~/data/grammar/sentence-structure.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/sentence-structure")({
	component: SentenceStructureComponent,
});

interface Pattern {
	id: string;
	title: string;
	description: string;
	pattern: {
		structure: string;
		template: string;
		fullPattern?: string;
	};
	examples: Example[];
}

interface PracticeSentence {
	vietnamese: string;
	english: string;
	pattern: string;
	difficulty: string;
}

function PatternSection({ pattern }: { pattern: Pattern }) {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="font-bold font-serif text-2xl text-gold">
					{pattern.title}
				</h2>
				<p className="mt-2 text-white/70">{pattern.description}</p>
			</div>

			{/* Pattern structure display */}
			<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
				<div className="mb-2 font-semibold text-gold">Pattern Structure:</div>
				<div className="font-mono text-lg text-white">
					{pattern.pattern.structure}
				</div>
				<div className="mt-2 font-mono text-sm text-white/60">
					{pattern.pattern.template}
				</div>
				{pattern.pattern.fullPattern && (
					<div className="mt-3 border-white/10 border-t pt-3 text-white/50 text-xs">
						Full pattern: {pattern.pattern.fullPattern}
					</div>
				)}
			</div>

			{/* Examples */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg text-white">Examples:</h3>
				<GrammarPracticeGrid examples={pattern.examples} />
			</div>
		</div>
	);
}

function SentenceStructureComponent() {
	const data = structureData as unknown as {
		introduction: {
			title: string;
			content: string[];
		};
		patterns: Pattern[];
		practiceSentences: PracticeSentence[];
	};

	// Prepare practice data for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				pattern: sentence.pattern,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<
			string,
			{ meaning: string; pattern: string; difficulty: string }
		>,
	);

	return (
		<Layout>
			<div className="space-y-8">
				<Disclosure
					className="w-full"
					title={
						<span className="font-bold text-gold text-lg">
							Understanding Vietnamese Sentence Structure
						</span>
					}
				>
					<div className="space-y-4">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph.slice(0, 50)}>{paragraph}</p>
						))}

						<div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
							<p className="font-semibold text-gold">
								Key Differences from English:
							</p>
							<ul className="mt-2 ml-6 list-disc space-y-2">
								<li>
									<strong>Modifiers follow nouns:</strong> "con mèo đen" (cat
									black) not "black cat"
								</li>
								<li>
									<strong>Topic-prominent:</strong> Important information can be
									fronted for emphasis
								</li>
								<li>
									<strong>Serial verbs:</strong> Multiple verbs without
									conjunctions
								</li>
								<li>
									<strong>No conjugation:</strong> Verbs don't change form based
									on tense or subject
								</li>
							</ul>
						</div>
					</div>
				</Disclosure>

				{/* Pattern sections */}
				{data.patterns.map((pattern) => (
					<PatternSection key={pattern.id} pattern={pattern} />
				))}

				{/* Practice section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Sentences
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Try pronouncing these sentences that demonstrate the patterns
							above
						</p>
					</div>

					<PracticeGrid<{
						meaning: string;
						pattern: string;
						difficulty: string;
					}>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Pattern: item.pattern
								.replace("-", " ")
								.replace(/\b\w/g, (l) => l.toUpperCase()),
							Difficulty:
								item.difficulty.charAt(0).toUpperCase() +
								item.difficulty.slice(1),
						})}
					/>
				</div>
			</div>
		</Layout>
	);
}
