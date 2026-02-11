import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import focusMarkersData from "~/data/grammar/focus-markers.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/lib/grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/focus-markers")({
	component: FocusMarkersComponent,
});

// Types matching the JSON structure
interface Breakdown {
	type: string;
	meaning: string;
}

interface ContrastiveExample {
	id: string;
	scenario: string;
	withoutFocus: Example;
	withFocus: Example;
	focusedElement: string;
	connotation: string;
	explanation: string;
}

interface ComparisonExample {
	vietnamese: string;
	english: string;
	valid: boolean;
	note: string;
}

interface ComparisonType {
	type: string;
	function: string;
	pattern: string;
	examples: ComparisonExample[];
}

interface PositionRule {
	rule: string;
	correct: string;
	correctEnglish: string;
	incorrect: string;
	explanation: string;
}

interface CommonPhrase {
	vietnamese: string;
	breakdown: Record<string, Breakdown>;
	english: string;
	connotation: string;
}

interface PracticeSentence {
	vietnamese: string;
	english: string;
	difficulty: string;
}

interface FocusMarkersData {
	introduction: {
		title: string;
		content: string[];
	};
	classifierVsFocus: {
		title: string;
		description: string;
		comparison: ComparisonType[];
	};
	positionRules: {
		title: string;
		rules: PositionRule[];
	};
	contrastiveExamples: {
		title: string;
		description: string;
		examples: ContrastiveExample[];
	};
	commonPhrases: {
		title: string;
		phrases: CommonPhrase[];
	};
	practiceSentences: PracticeSentence[];
}

const data = focusMarkersData as unknown as FocusMarkersData;

// Helper to strip subscript numbers from Vietnamese words
const stripSubscript = (text: string) => text.replace(/[₀-₉]+$/, "");

// Extended color mapping for focus markers
const FOCUS_TYPE_COLORS = {
	...GRAMMAR_TYPE_COLORS,
	focus: "text-pink-400 font-bold",
	"adjective-stressed": "text-lime-300 font-bold",
	"object-stressed": "text-yellow-300 font-bold",
	"demonstrative-stressed": "text-purple-300 font-bold",
};

// Component for side-by-side comparison of with/without focus marker
function ContrastiveComparison({ example }: { example: ContrastiveExample }) {
	const getConnotationColor = (connotation: string) => {
		switch (connotation) {
			case "dismissive":
			case "negative":
				return "border-red-500/50 bg-red-500/10";
			case "positive":
				return "border-green-500/50 bg-green-500/10";
			default:
				return "border-blue-500/50 bg-blue-500/10";
		}
	};

	return (
		<Card className={getConnotationColor(example.connotation)}>
			<div className="space-y-4">
				{/* Scenario header */}
				<div className="border-white/20 border-b pb-3">
					<div className="font-semibold text-lg text-warm-cream">
						{example.scenario}
					</div>
					<div className="mt-1 flex items-center gap-2 text-sm">
						<span className="text-white/60">Focused element:</span>
						<span className="text-pink-300">{example.focusedElement}</span>
						<span className="ml-auto rounded px-2 py-0.5 text-xs capitalize">
							{example.connotation}
						</span>
					</div>
				</div>

				{/* Side-by-side comparison */}
				<div className="grid gap-4 md:grid-cols-2">
					{/* Without focus */}
					<div className="space-y-2">
						<div className="font-semibold text-sm text-white/50">
							Without Focus Marker
						</div>
						<GrammarPracticeGrid examples={[example.withoutFocus]} />
					</div>

					{/* With focus */}
					<div className="space-y-2">
						<div className="font-semibold text-pink-300 text-sm">
							With Focus Marker
						</div>
						<GrammarPracticeGrid examples={[example.withFocus]} />
					</div>
				</div>

				{/* Explanation */}
				<div className="border-white/20 border-t pt-3 text-sm text-white/70">
					{example.explanation}
				</div>
			</div>
		</Card>
	);
}

function FocusMarkersComponent() {
	// Transform practice sentences for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<string, { meaning: string; difficulty: string }>,
	);

	// Get difficulty color
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "easy":
				return "text-green-400";
			case "medium":
				return "text-yellow-400";
			case "hard":
				return "text-red-400";
			default:
				return "text-white/70";
		}
	};

	return (
		<Layout>
			<div className="space-y-8">
				{/* Introduction */}
				<Disclosure
					defaultOpen
					title={
						<span className="font-bold text-gold text-lg">
							{data.introduction.title}
						</span>
					}
				>
					<div className="space-y-3">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Classifier vs Focus Marker - CRITICAL DISTINCTION */}
				<section className="space-y-4">
					<div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
						<div className="flex items-center gap-2">
							<span className="text-2xl">⚠️</span>
							<div>
								<h2 className="font-bold font-serif text-2xl text-amber-300">
									{data.classifierVsFocus.title}
								</h2>
								<p className="mt-1 text-sm text-white/70">
									{data.classifierVsFocus.description}
								</p>
							</div>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{data.classifierVsFocus.comparison.map((compType) => (
							<Card
								key={compType.type}
								className="border-purple-500/30 bg-purple-500/5"
							>
								<div className="space-y-3">
									<div className="font-bold text-lg text-purple-300">
										{compType.type}
									</div>
									<div className="text-sm text-white/80">
										{compType.function}
									</div>
									<div className="rounded border border-gold/30 bg-gold/5 px-3 py-1.5">
										<span className="font-mono text-gold text-sm">
											{compType.pattern}
										</span>
									</div>

									{/* Examples */}
									<div className="space-y-2 border-white/20 border-t pt-2">
										{compType.examples.map((ex) => (
											<div
												key={ex.vietnamese}
												className={`rounded border p-2 ${
													ex.valid
														? "border-green-500/30 bg-green-500/5"
														: "border-red-500/30 bg-red-500/5"
												}`}
											>
												<div className="flex items-center gap-2">
													<span
														className={
															ex.valid ? "text-green-300" : "text-red-300"
														}
													>
														{ex.valid ? "✓" : "✗"}
													</span>
													<span className="font-medium text-warm-cream">
														{ex.vietnamese}
													</span>
													{ex.valid && (
														<SpeakButton text={ex.vietnamese} size="small" />
													)}
												</div>
												<div className="mt-1 ml-6 text-sm text-white/70">
													{ex.english}
												</div>
												<div className="ml-6 text-white/50 text-xs">
													{ex.note}
												</div>
											</div>
										))}
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Position Rules */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.positionRules.title}
						</h2>
					</div>

					<div className="space-y-3">
						{data.positionRules.rules.map((rule, idx) => (
							<Card
								key={rule.rule}
								className="border-blue-500/20 bg-blue-500/5"
							>
								<div className="space-y-3">
									<div className="font-semibold text-blue-300 text-lg">
										{idx + 1}. {rule.rule}
									</div>

									<div className="grid gap-3 md:grid-cols-2">
										{/* Correct */}
										<div className="rounded border border-green-500/30 bg-green-500/5 p-3">
											<div className="mb-1 font-semibold text-green-400 text-xs uppercase">
												Correct
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium text-warm-cream">
													{rule.correct}
												</span>
												<SpeakButton text={rule.correct} size="small" />
											</div>
											<div className="mt-1 text-sm text-white/70">
												{rule.correctEnglish}
											</div>
										</div>

										{/* Incorrect */}
										<div className="rounded border border-red-500/30 bg-red-500/5 p-3">
											<div className="mb-1 font-semibold text-red-400 text-xs uppercase">
												Incorrect
											</div>
											<div className="font-medium text-red-300 line-through">
												{rule.incorrect}
											</div>
										</div>
									</div>

									<div className="text-sm text-white/60">
										{rule.explanation}
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Contrastive Examples */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.contrastiveExamples.title}
						</h2>
						<p className="mt-1 text-sm text-white/60">
							{data.contrastiveExamples.description}
						</p>
					</div>

					<div className="space-y-4">
						{data.contrastiveExamples.examples.map((example) => (
							<ContrastiveComparison key={example.id} example={example} />
						))}
					</div>
				</section>

				{/* Common Phrases */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.commonPhrases.title}
						</h2>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{data.commonPhrases.phrases.map((phrase) => (
							<Card
								key={phrase.vietnamese}
								className={
									phrase.connotation === "dismissive"
										? "border-orange-500/30 bg-orange-500/5"
										: "border-cyan-500/20 bg-cyan-500/5"
								}
							>
								<div className="space-y-3">
									{/* Vietnamese with audio */}
									<div className="flex items-center gap-2">
										<span className="font-medium text-lg text-warm-cream">
											{phrase.vietnamese}
										</span>
										<SpeakButton text={phrase.vietnamese} size="small" />
										<span className="ml-auto rounded bg-black/30 px-2 py-0.5 text-white/60 text-xs capitalize">
											{phrase.connotation}
										</span>
									</div>

									{/* Breakdown */}
									<div className="flex flex-wrap gap-2">
										{Object.entries(phrase.breakdown).map(([word, info]) => {
											const displayWord = stripSubscript(word);
											const colorClass =
												FOCUS_TYPE_COLORS[
													info.type as keyof typeof FOCUS_TYPE_COLORS
												] || "text-white/70";

											return (
												<div key={word} className="flex flex-col">
													<span className={`font-medium text-sm ${colorClass}`}>
														{displayWord}
													</span>
													<span className="text-white/40 text-xs">
														{info.meaning}
													</span>
												</div>
											);
										})}
									</div>

									{/* English */}
									<div className="border-white/20 border-t pt-2 text-gold text-sm">
										{phrase.english}
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Practice Section */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Sentences
						</h2>
						<p className="mt-1 text-sm text-white/60">
							Practice using focus markers with proper stress and intonation
						</p>
					</div>

					<PracticeGrid
						data={practiceData}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Difficulty: (
								<span className={getDifficultyColor(item.difficulty)}>
									{item.difficulty}
								</span>
							),
						})}
					/>
				</section>
			</div>
		</Layout>
	);
}
