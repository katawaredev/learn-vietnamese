import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import questionsData from "~/data/grammar/questions.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/questions")({
	component: QuestionsComponent,
});

interface Pattern {
	id: string;
	title: string;
	description: string;
	structure: string;
	examples: Example[];
}

interface QuestionWord {
	vietnamese: string;
	english: string;
	usage: string;
	example: string;
}

interface Particle {
	vietnamese: string;
	english: string;
	nuance: string;
	formality: string;
	example: string;
}

interface RhetoricalPhrase {
	vietnamese: string;
	english: string;
	usage: string;
	example: string;
}

interface QuestionType {
	id: string;
	title: string;
	description: string;
	questionWords?: QuestionWord[];
	patterns?: Pattern[];
	particles?: Particle[];
	phrases?: RhetoricalPhrase[];
	examples?: Example[];
}

function QuestionsComponent() {
	const data = questionsData as unknown as {
		introduction: {
			title: string;
			content: string[];
		};
		questionTypes: QuestionType[];
		practiceSentences: Array<{
			vietnamese: string;
			english: string;
			type: string;
			difficulty: string;
		}>;
	};

	// Prepare practice data for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				type: sentence.type,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<string, { meaning: string; type: string; difficulty: string }>,
	);

	return (
		<Layout>
			<div className="space-y-8">
				<Disclosure
					className="w-full"
					title={
						<span className="font-bold text-gold text-lg">
							Understanding Vietnamese Questions
						</span>
					}
				>
					<div className="space-y-4">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph.slice(0, 50)}>{paragraph}</p>
						))}

						<div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
							<p className="font-semibold text-gold">Three Question Types:</p>
							<ul className="mt-2 ml-6 list-disc space-y-2">
								<li>
									<strong>Wh-Questions:</strong> Use question words (who, what,
									where, when, why, how) that stay in logical position
								</li>
								<li>
									<strong>Yes-No Questions:</strong> Add particles at the end
									(không, phải không, etc.) with different nuances
								</li>
								<li>
									<strong>Rhetorical Questions:</strong> Express opinions or
									feelings without expecting answers
								</li>
							</ul>
						</div>
					</div>
				</Disclosure>

				{/* Question Types Sections */}
				{data.questionTypes.map((type) => (
					<div key={type.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{type.title}
							</h2>
							<p className="mt-2 text-white/70">{type.description}</p>
						</div>

						{/* Question Words Table */}
						{type.questionWords && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">
									Question Words:
								</h3>
								<div className="grid gap-3">
									{type.questionWords.map((qw) => (
										<div
											key={qw.vietnamese}
											className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
										>
											<div className="shrink-0">
												<div className="font-bold text-pink-500 text-xl">
													{qw.vietnamese}
												</div>
												<div className="text-sm text-white/50">
													{qw.english}
												</div>
											</div>
											<div className="grow">
												<div className="text-sm text-white/70">{qw.usage}</div>
												<div className="mt-2 font-mono text-sm text-warm-cream">
													{qw.example}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Patterns with Examples */}
						{type.patterns?.map((pattern) => (
							<div key={pattern.id} className="space-y-4">
								<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
									<div className="mb-2 font-semibold text-gold">
										{pattern.title}
									</div>
									<div className="text-sm text-white/70">
										{pattern.description}
									</div>
									<div className="mt-2 font-mono text-sm text-white/60">
										Pattern: {pattern.structure}
									</div>
								</div>

								<div className="space-y-4">
									<GrammarPracticeGrid examples={pattern.examples} />
								</div>
							</div>
						))}

						{/* Particles Table */}
						{type.particles && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">
									Question Particles & Their Nuances:
								</h3>
								<div className="grid gap-3">
									{type.particles.map((particle) => (
										<div
											key={particle.vietnamese}
											className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
										>
											<div className="w-32 shrink-0">
												<div className="font-bold text-lg text-orange-400">
													{particle.vietnamese}
												</div>
												<div className="text-white/50 text-xs">
													{particle.formality}
												</div>
											</div>
											<div className="grow">
												<div className="font-semibold text-sm text-white">
													{particle.english}
												</div>
												<div className="mt-1 text-sm text-white/60">
													{particle.nuance}
												</div>
												<div className="mt-2 font-mono text-sm text-warm-cream">
													{particle.example}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Rhetorical Phrases */}
						{type.phrases && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">
									Rhetorical Question Phrases:
								</h3>
								<div className="grid gap-3">
									{type.phrases.map((phrase) => (
										<div
											key={phrase.vietnamese}
											className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
										>
											<div className="shrink-0">
												<div className="font-bold text-lg text-rose-500">
													{phrase.vietnamese}
												</div>
												<div className="text-sm text-white/50">
													{phrase.english}
												</div>
											</div>
											<div className="grow">
												<div className="text-sm text-white/70">
													{phrase.usage}
												</div>
												<div className="mt-2 font-mono text-sm text-warm-cream">
													{phrase.example}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Examples */}
						{type.examples && type.examples.length > 0 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">Examples:</h3>
								<GrammarPracticeGrid examples={type.examples} />
							</div>
						)}
					</div>
				))}

				{/* Practice Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Questions
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Try asking these questions to practice different question types
						</p>
					</div>

					<PracticeGrid<{ meaning: string; type: string; difficulty: string }>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Type:
								item.type === "wh-question"
									? "Wh-Question"
									: item.type === "yes-no"
										? "Yes-No Question"
										: "Rhetorical",
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
