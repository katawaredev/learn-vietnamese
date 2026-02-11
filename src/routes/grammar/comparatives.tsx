import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import comparativesData from "~/data/grammar/comparatives.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/comparatives")({
	component: ComparativesComponent,
});

// Types matching the JSON structure
interface Pattern {
	structure: string;
	meaning: string;
	description?: string;
	usage?: string;
	pattern?: string;
	examples: Example[];
	highlight?: boolean;
}

interface Intensifier {
	vietnamese: string;
	meaning: string;
	strength: string;
	examples: Example[];
}

interface Section {
	id: string;
	title: string;
	description: string;
	patterns: Pattern[];
	intensifiers?: Intensifier[];
}

interface SpectrumLevel {
	type: string;
	particle: string;
	meaning: string;
	example: string;
}

interface PracticeSentence {
	vietnamese: string;
	english: string;
	type: string;
	difficulty: string;
}

interface ComparativesData {
	introduction: {
		title: string;
		content: string[];
	};
	sections: Section[];
	comparisonSpectrum: {
		title: string;
		description: string;
		levels: SpectrumLevel[];
	};
	practiceSentences: PracticeSentence[];
}

const data = comparativesData as ComparativesData;

function ComparativesComponent() {
	// Transform practice sentences for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				type: sentence.type,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<
			string,
			{
				meaning: string;
				type: string;
				difficulty: string;
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

	// Get type color
	const getTypeColor = (type: string) => {
		switch (type) {
			case "comparative":
				return "text-cyan-400";
			case "equality":
				return "text-blue-400";
			case "inferiority":
				return "text-purple-400";
			case "superlative":
				return "text-amber-400";
			case "special":
				return "text-pink-400";
			case "preference":
				return "text-emerald-400";
			default:
				return "text-white/70";
		}
	};

	// Get spectrum type color
	const getSpectrumColor = (type: string) => {
		switch (type) {
			case "inferiority":
				return "border-purple-500/50 bg-purple-500/10";
			case "equality":
				return "border-blue-500/50 bg-blue-500/10";
			case "comparative":
				return "border-cyan-500/50 bg-cyan-500/10";
			case "superlative":
				return "border-amber-500/50 bg-amber-500/10";
			default:
				return "border-white/20 bg-white/5";
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

						{/* Visual comparison: English vs Vietnamese */}
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<Card className="border-red-500/30 bg-red-500/5">
								<div className="space-y-2">
									<div className="font-semibold text-red-400">
										English (Changes Form)
									</div>
									<div className="space-y-1 text-sm">
										<div className="space-y-0.5">
											<div>
												tall → tall<span className="text-red-300">er</span> →
												tall<span className="text-red-300">est</span>
											</div>
											<div>
												good → <span className="text-red-300">better</span> →{" "}
												<span className="text-red-300">best</span>
											</div>
										</div>
										<div className="text-white/50 text-xs">
											Adjective changes form
										</div>
									</div>
								</div>
							</Card>

							<Card className="border-green-500/30 bg-green-500/5">
								<div className="space-y-2">
									<div className="font-semibold text-green-400">
										Vietnamese (Same Form)
									</div>
									<div className="space-y-1 text-sm">
										<div className="space-y-0.5">
											<div>
												cao → cao <span className="text-green-300">hơn</span> →
												cao <span className="text-green-300">nhất</span>
											</div>
											<div>
												tốt → tốt <span className="text-green-300">hơn</span> →
												tốt <span className="text-green-300">nhất</span>
											</div>
										</div>
										<div className="text-white/50 text-xs">
											Only the particle changes
										</div>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</Disclosure>

				{/* Comparison Spectrum */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.comparisonSpectrum.title}
						</h2>
						<p className="mt-1 text-sm text-white/60">
							{data.comparisonSpectrum.description}
						</p>
					</div>

					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
						{data.comparisonSpectrum.levels.map((level, idx) => (
							<Card key={level.type} className={getSpectrumColor(level.type)}>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="font-semibold text-lg text-white capitalize">
											{idx + 1}. {level.type}
										</span>
									</div>
									<div className="space-y-1 text-sm">
										<div className="text-white/80">
											Particle:{" "}
											<span className="font-mono text-gold">
												{level.particle}
											</span>
										</div>
										<div className="text-white/80">
											Meaning:{" "}
											<span className="text-warm-cream">{level.meaning}</span>
										</div>
										<div className="mt-2 rounded border border-white/20 bg-black/20 p-2">
											<div className="flex items-center gap-2">
												<span className="text-warm-cream text-xs">
													{level.example}
												</span>
												<SpeakButton text={level.example} size="small" />
											</div>
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Sections: Comparative, Inferiority, Equality, Superlative */}
				{data.sections
					.filter((section) => section.id !== "special-patterns")
					.map((section) => (
						<section key={section.id} className="space-y-4">
							<div>
								<h2 className="font-bold font-serif text-2xl text-gold">
									{section.title}
								</h2>
								<p className="mt-1 text-sm text-white/60">
									{section.description}
								</p>
							</div>

							{/* Patterns */}
							{section.patterns.map((pattern) => (
								<Card key={pattern.structure || pattern.pattern}>
									<div className="space-y-4">
										{/* Pattern header */}
										<div>
											<div className="mt-1 space-y-2">
												<div className="rounded border border-gold/30 bg-gold/5 px-3 py-1.5">
													<span className="font-mono text-gold text-sm">
														{pattern.structure || pattern.pattern}
													</span>
												</div>
												<div className="text-sm text-white/70">
													{pattern.meaning}
												</div>
												{pattern.description && (
													<div className="text-sm text-white/60">
														{pattern.description}
													</div>
												)}
												{pattern.usage && (
													<div className="text-blue-300 text-xs italic">
														Usage: {pattern.usage}
													</div>
												)}
											</div>
										</div>

										{/* Examples */}
										<div className="space-y-3">
											<GrammarPracticeGrid examples={pattern.examples} />
										</div>
									</div>
								</Card>
							))}

							{/* Intensifiers (only for comparative section) */}
							{section.intensifiers && (
								<div className="space-y-3">
									<h3 className="font-semibold text-lg text-warm-cream">
										Intensifying Comparatives
									</h3>
									<div className="grid gap-4 md:grid-cols-2">
										{section.intensifiers.map((intensifier) => (
											<Card
												key={intensifier.vietnamese}
												className="border-orange-500/20 bg-orange-500/5"
											>
												<div className="space-y-3">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<span className="font-semibold text-lg text-orange-400">
																{intensifier.vietnamese}
															</span>
															<SpeakButton
																text={intensifier.vietnamese}
																size="small"
															/>
														</div>
														<span className="text-white/50 text-xs">
															{intensifier.strength}
														</span>
													</div>
													<div className="text-sm text-white/80">
														{intensifier.meaning}
													</div>
													<div className="space-y-2 border-white/10 border-t pt-2">
														<GrammarPracticeGrid
															examples={intensifier.examples}
														/>
													</div>
												</div>
											</Card>
										))}
									</div>
								</div>
							)}
						</section>
					))}

				{/* Special Patterns Section - HIGHLIGHTED */}
				{data.sections
					.filter((section) => section.id === "special-patterns")
					.map((section) => (
						<section key={section.id} className="space-y-4">
							<div className="rounded-lg border-2 border-pink-500/50 bg-pink-500/10 p-4">
								<div className="flex items-center gap-2">
									<span className="text-2xl">🌟</span>
									<div>
										<h2 className="font-bold font-serif text-2xl text-pink-300">
											{section.title}
										</h2>
										<p className="mt-1 text-sm text-white/70">
											{section.description}
										</p>
									</div>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								{section.patterns.map((pattern) => {
									const isHighlighted = pattern.highlight;
									return (
										<Card
											key={pattern.pattern || pattern.structure}
											className={
												isHighlighted
													? "border-pink-500/30 bg-pink-500/5"
													: "border-blue-500/20 bg-blue-500/5"
											}
										>
											<div className="space-y-3">
												{/* Pattern header */}
												<div>
													<div className="flex items-center gap-2">
														<span
															className={`font-semibold text-lg ${
																isHighlighted
																	? "text-pink-300"
																	: "text-blue-300"
															}`}
														>
															{pattern.pattern}
														</span>
													</div>
													<div className="mt-1 space-y-2">
														<div className="rounded border border-gold/30 bg-gold/5 px-3 py-1.5">
															<span className="font-mono text-gold text-sm">
																{pattern.structure}
															</span>
														</div>
														<div className="text-sm text-white/70">
															{pattern.meaning}
														</div>
														{pattern.description && (
															<div className="text-white/60 text-xs">
																{pattern.description}
															</div>
														)}
													</div>
												</div>

												{/* Examples */}
												<div className="space-y-2 border-white/10 border-t pt-2">
													<GrammarPracticeGrid examples={pattern.examples} />
												</div>
											</div>
										</Card>
									);
								})}
							</div>
						</section>
					))}

				{/* Practice Section */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Sentences
						</h2>
						<p className="mt-1 text-sm text-white/60">
							Practice all types of comparisons with complete sentences
						</p>
					</div>

					<PracticeGrid
						data={practiceData}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Type: (
								<span className={getTypeColor(item.type)}>{item.type}</span>
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
