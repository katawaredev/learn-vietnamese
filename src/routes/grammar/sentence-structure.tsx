import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import structureData from "~/data/grammar/sentence-structure.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
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

interface Breakdown {
	type: string;
	meaning: string;
}

interface PluralExample {
	vietnamese: string;
	breakdown: Record<string, Breakdown>;
	english: string;
	literalEnglish: string;
	notes?: string;
}

interface PluralMarker {
	marker: string;
	meaning: string;
	usage: string;
	examples: PluralExample[];
}

interface PluralComparison {
	context: string;
	vietnamese: string;
	english: string;
	notes: string;
}

interface PluralsData {
	title: string;
	description: string;
	keyPoints: string[];
	markers: PluralMarker[];
	comparison: PluralComparison[];
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
				<h3>Examples:</h3>
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
		plurals: PluralsData;
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
					defaultOpen
					title={
						<span className="font-bold text-lg">
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

				{/* Plurals Section */}
				<section className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.plurals.title}
						</h2>
						<p className="mt-2 text-white/70">{data.plurals.description}</p>
					</div>

					{/* Key Points */}
					<div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
						<p className="mb-2 font-semibold text-green-400">
							What Vietnamese doesn't have:
						</p>
						<ul className="ml-6 list-disc space-y-1">
							{data.plurals.keyPoints.map((point) => (
								<li key={point.slice(0, 30)} className="text-sm text-white/80">
									{point}
								</li>
							))}
						</ul>
					</div>

					{/* Plural Markers */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-warm-cream">
							Plural Markers
						</h3>
						{data.plurals.markers.map((marker) => (
							<Card key={marker.marker}>
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<span className="font-semibold text-gold text-lg">
											{marker.marker}
										</span>
										<SpeakButton text={marker.marker} size="small" />
										<span className="text-sm text-white/60">
											— {marker.meaning}
										</span>
									</div>
									<p className="text-sm text-white/70">{marker.usage}</p>

									{marker.examples.map((ex) => (
										<div
											key={ex.vietnamese}
											className="rounded-lg border border-white/10 bg-white/5 p-3"
										>
											<div className="flex items-center gap-2">
												<span className="font-medium text-warm-cream">
													{ex.vietnamese}
												</span>
												<SpeakButton text={ex.vietnamese} size="small" />
											</div>
											<div className="mt-1 text-gold text-sm">{ex.english}</div>
											{/* Breakdown */}
											<div className="mt-2 flex flex-wrap gap-2">
												{Object.entries(ex.breakdown).map(([word, info]) => {
													const colorClass =
														GRAMMAR_TYPE_COLORS[
															info.type as keyof typeof GRAMMAR_TYPE_COLORS
														];
													return (
														<div key={word} className="flex flex-col">
															<span
																className={`font-medium text-xs ${colorClass}`}
															>
																{word}
															</span>
															<span className="text-white/40 text-xs">
																{info.meaning}
															</span>
														</div>
													);
												})}
											</div>
											{ex.notes && (
												<div className="mt-1 text-blue-300 text-xs italic">
													{ex.notes}
												</div>
											)}
										</div>
									))}
								</div>
							</Card>
						))}
					</div>

					{/* Comparison */}
					<div className="space-y-3">
						<h3 className="font-semibold text-lg text-warm-cream">
							Quick Comparison
						</h3>
						<div className="grid gap-3">
							{data.plurals.comparison.map((item) => (
								<Card key={item.context} className="border-gold/20 bg-gold/5">
									<div className="space-y-1">
										<div className="font-medium text-gold text-sm">
											{item.context}
										</div>
										<div className="flex items-center gap-2">
											<span className="text-warm-cream">{item.vietnamese}</span>
											<SpeakButton text={item.vietnamese} size="small" />
										</div>
										<div className="text-sm text-white/60">{item.english}</div>
										<div className="text-blue-300 text-xs italic">
											{item.notes}
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				</section>

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
