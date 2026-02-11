import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import adjectivesData from "~/data/grammar/adjectives.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/lib/grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/adjectives")({
	component: AdjectivesComponent,
});

// Types matching the JSON structure
interface Breakdown {
	type: string;
	meaning: string;
}

interface Pattern {
	type: string;
	description: string;
	structure: string;
	examples: Example[];
}

interface IntensifierExample {
	vietnamese: string;
	english: string;
	connotation?: string;
}

interface Intensifier {
	intensifier: string;
	meaning: string;
	connotation: string;
	strength: string;
	examples: IntensifierExample[];
	notes: string;
}

interface ReduplicationExample {
	base: string;
	reduplicated: string;
	baseMeaning: string;
	reduplicatedMeaning: string;
	vietnamese: string;
	english: string;
}

interface ReduplicationType {
	type: string;
	pattern: string;
	effect: string;
	examples: ReduplicationExample[];
}

interface CategoryAdjective {
	adjective: string;
	meaning: string;
}

interface PracticeSentence {
	vietnamese: string;
	breakdown: Record<string, Breakdown>;
	english: string;
	literalEnglish?: string;
	difficulty: string;
	notes?: string;
}

interface AdjectivesData {
	introduction: {
		title: string;
		content: string[];
	};
	patterns: Pattern[];
	intensifiers: Intensifier[];
	reduplication: ReduplicationType[];
	categories: Record<string, CategoryAdjective[]>;
	practiceSentences: PracticeSentence[];
}

const data = adjectivesData as unknown as AdjectivesData;

// Helper to strip subscript numbers from Vietnamese words
const stripSubscript = (text: string) => text.replace(/[₀-₉]+$/, "");

function AdjectivesComponent() {
	// Transform practice sentences for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				difficulty: sentence.difficulty,
				breakdown: sentence.breakdown,
				literalEnglish: sentence.literalEnglish,
				notes: sentence.notes,
			};
			return acc;
		},
		{} as Record<
			string,
			{
				meaning: string;
				difficulty: string;
				breakdown: Record<string, Breakdown>;
				literalEnglish?: string;
				notes?: string;
			}
		>,
	);

	// Get difficulty color
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return "text-green-400";
			case "intermediate":
				return "text-yellow-400";
			case "advanced":
				return "text-red-400";
			default:
				return "text-white/70";
		}
	};

	// Get strength color for intensifiers
	const getStrengthColor = (strength: string) => {
		switch (strength) {
			case "mild":
				return "text-green-400";
			case "moderate":
				return "text-yellow-400";
			case "strong":
				return "text-orange-400";
			case "very strong":
				return "text-red-400";
			default:
				return "text-white/70";
		}
	};

	// Get connotation indicator
	const getConnotationIndicator = (connotation: string) => {
		if (connotation.includes("positive")) return "✓";
		if (connotation.includes("negative")) return "⚠";
		return "○";
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
						{data.introduction.content.map((paragraph, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: content is static text without unique identifiers
							<p key={idx} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}

						{/* Visual comparison */}
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<Card className="border-red-500/30 bg-red-500/5">
								<div className="space-y-2">
									<div className="font-semibold text-red-400">
										English Order
									</div>
									<div className="space-y-1 text-sm">
										<div>
											<span className="text-lime-400">beautiful</span>{" "}
											<span className="text-amber-400">house</span>
										</div>
										<div className="text-white/50 text-xs">
											ADJECTIVE + NOUN
										</div>
									</div>
								</div>
							</Card>

							<Card className="border-green-500/30 bg-green-500/5">
								<div className="space-y-2">
									<div className="font-semibold text-green-400">
										Vietnamese Order
									</div>
									<div className="space-y-1 text-sm">
										<div>
											<span className="text-amber-400">nhà</span>{" "}
											<span className="text-lime-400">đẹp</span>
										</div>
										<div className="text-white/50 text-xs">
											NOUN + ADJECTIVE
										</div>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</Disclosure>

				{/* Patterns Section */}
				<section className="space-y-4">
					<h2 className="font-bold font-serif text-2xl text-gold">
						Adjective Patterns
					</h2>

					{data.patterns.map((pattern) => (
						<Card key={pattern.type}>
							<div className="space-y-4">
								{/* Pattern header */}
								<div>
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-lg text-warm-cream">
											{pattern.type}
										</h3>
									</div>
									<p className="mt-1 text-sm text-white/60">
										{pattern.description}
									</p>
									<div className="mt-2 rounded border border-gold/30 bg-gold/5 px-3 py-1.5">
										<span className="font-mono text-gold text-sm">
											{pattern.structure}
										</span>
									</div>
								</div>

								{/* Examples */}
								<div className="space-y-3">
									<GrammarPracticeGrid examples={pattern.examples} />
								</div>
							</div>
						</Card>
					))}
				</section>

				{/* Intensifiers Section */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Intensifiers
						</h2>
						<p className="mt-1 text-sm text-white/60">
							Words that modify the strength of adjectives - each has different
							connotations
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{data.intensifiers.map((intensifier) => (
							<Card
								key={intensifier.intensifier}
								className="border-orange-500/20 bg-orange-500/5"
							>
								<div className="space-y-3">
									{/* Intensifier header */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-lg text-orange-400">
												{intensifier.intensifier}
											</span>
											<SpeakButton
												text={intensifier.intensifier}
												size="small"
											/>
										</div>
										<span className="text-2xl" title={intensifier.connotation}>
											{getConnotationIndicator(intensifier.connotation)}
										</span>
									</div>

									<div className="space-y-1 text-sm">
										<div className="text-white/80">
											Meaning:{" "}
											<span className="text-gold">{intensifier.meaning}</span>
										</div>
										<div className="text-white/80">
											Strength:{" "}
											<span className={getStrengthColor(intensifier.strength)}>
												{intensifier.strength}
											</span>
										</div>
										<div className="text-white/80">
											Connotation:{" "}
											<span className="text-warm-cream">
												{intensifier.connotation}
											</span>
										</div>
									</div>

									{/* Examples */}
									<div className="space-y-2 border-white/10 border-t pt-2">
										{intensifier.examples.map((ex) => (
											<div
												key={ex.vietnamese}
												className="flex items-center justify-between text-sm"
											>
												<div className="flex items-center gap-2">
													<span className="text-warm-cream">
														{ex.vietnamese}
													</span>
													<SpeakButton text={ex.vietnamese} size="small" />
												</div>
												<span className="text-white/50 text-xs">
													{ex.english}
												</span>
											</div>
										))}
									</div>

									{/* Notes */}
									<div className="text-blue-300 text-xs italic">
										{intensifier.notes}
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Reduplication Section - UNIQUE FEATURE */}
				<section className="space-y-4">
					<div className="rounded-lg border-2 border-purple-500/50 bg-purple-500/10 p-4">
						<div className="flex items-center gap-2">
							<span className="text-2xl">✨</span>
							<div>
								<h2 className="font-bold font-serif text-2xl text-purple-300">
									Reduplication - Unique Vietnamese Feature
								</h2>
								<p className="mt-1 text-sm text-white/70">
									Repeating or modifying adjectives to change their meaning - a
									distinctive feature of Vietnamese
								</p>
							</div>
						</div>
					</div>

					{data.reduplication.map((redupType) => (
						<Card
							key={redupType.type}
							className="border-purple-500/20 bg-purple-500/5"
						>
							<div className="space-y-4">
								{/* Type header */}
								<div>
									<h3 className="font-semibold text-lg text-purple-300">
										{redupType.type}
									</h3>
									<div className="mt-1 space-y-1 text-sm">
										<div className="text-white/70">
											Pattern:{" "}
											<span className="font-mono text-purple-400">
												{redupType.pattern}
											</span>
										</div>
										<div className="text-white/70">
											Effect:{" "}
											<span className="text-warm-cream">
												{redupType.effect}
											</span>
										</div>
									</div>
								</div>

								{/* Examples */}
								<div className="grid gap-3 md:grid-cols-2">
									{redupType.examples.map((ex) => (
										<div
											key={ex.vietnamese}
											className="rounded-lg border border-purple-500/20 bg-black/20 p-3"
										>
											<div className="space-y-2">
												{/* Base vs Reduplicated */}
												<div className="grid grid-cols-2 gap-2 text-sm">
													<div>
														<div className="text-white/50 text-xs">Base</div>
														<div className="flex items-center gap-1">
															<span className="font-medium text-warm-cream">
																{ex.base}
															</span>
															<SpeakButton text={ex.base} size="small" />
														</div>
														<div className="text-white/60 text-xs">
															{ex.baseMeaning}
														</div>
													</div>
													<div>
														<div className="text-white/50 text-xs">
															Reduplicated
														</div>
														<div className="flex items-center gap-1">
															<span className="font-medium text-purple-300">
																{ex.reduplicated}
															</span>
															<SpeakButton
																text={ex.reduplicated}
																size="small"
															/>
														</div>
														<div className="text-white/60 text-xs">
															{ex.reduplicatedMeaning}
														</div>
													</div>
												</div>

												{/* Example sentence */}
												<div className="space-y-1 border-white/10 border-t pt-2">
													<div className="flex items-center gap-2">
														<span className="text-sm text-warm-cream">
															{ex.vietnamese}
														</span>
														<SpeakButton text={ex.vietnamese} size="small" />
													</div>
													<div className="text-gold text-xs">{ex.english}</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</Card>
					))}
				</section>

				{/* Common Adjectives by Category */}
				<section className="space-y-4">
					<h2 className="font-bold font-serif text-2xl text-gold">
						Common Adjectives by Category
					</h2>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{Object.entries(data.categories).map(([category, adjectives]) => (
							<Card key={category} className="border-gold/20 bg-gold/5">
								<div className="space-y-3">
									<h3 className="font-semibold text-gold capitalize">
										{category}
									</h3>
									<div className="space-y-2">
										{adjectives.map((adj) => (
											<div
												key={adj.adjective}
												className="flex items-center justify-between text-sm"
											>
												<div className="flex items-center gap-2">
													<span className="font-medium text-warm-cream">
														{adj.adjective}
													</span>
													<SpeakButton text={adj.adjective} size="small" />
												</div>
												<span className="text-white/50 text-xs">
													{adj.meaning}
												</span>
											</div>
										))}
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
							Practice using adjectives in context with complete sentences
						</p>
					</div>

					<PracticeGrid
						data={practiceData}
						getDetails={(vietnamese, item) => {
							const details: Record<string, React.JSX.Element> = {
								Vietnamese: (
									<span className="text-warm-cream">{vietnamese}</span>
								),
								English: (
									<span className="font-bold text-gold">{item.meaning}</span>
								),
								Difficulty: (
									<span className={getDifficultyColor(item.difficulty)}>
										{item.difficulty}
									</span>
								),
							};

							if (item.literalEnglish) {
								details["Literal English"] = (
									<span className="text-white/60 italic">
										{item.literalEnglish}
									</span>
								);
							}

							if (item.notes) {
								details.Notes = (
									<span className="text-blue-300 text-sm">{item.notes}</span>
								);
							}

							// Add breakdown
							if (item.breakdown) {
								details.Breakdown = (
									<div className="flex flex-wrap gap-2">
										{Object.entries(item.breakdown).map(([word, info]) => {
											const displayWord = stripSubscript(word);
											const colorClass =
												GRAMMAR_TYPE_COLORS[
													info.type as keyof typeof GRAMMAR_TYPE_COLORS
												] || "text-white/70";

											return (
												<div key={word} className="flex flex-col">
													<span className={`font-medium text-xs ${colorClass}`}>
														{displayWord}
													</span>
													<span className="text-white/40 text-xs">
														{info.meaning}
													</span>
												</div>
											);
										})}
									</div>
								);
							}

							return details;
						}}
					/>
				</section>
			</div>
		</Layout>
	);
}
