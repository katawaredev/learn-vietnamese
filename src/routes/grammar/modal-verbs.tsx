import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import modalVerbsData from "~/data/grammar/modal-verbs.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/modal-verbs")({
	component: ModalVerbsComponent,
});

interface BreakdownItem {
	type: string;
	meaning: string;
}

interface Example {
	vietnamese: string;
	breakdown: Record<string, BreakdownItem>;
	english: string;
	literalEnglish?: string;
	notes?: string;
	meaning?: string;
}

interface Modal {
	vietnamese: string;
	english: string;
	strength?: string;
	nuance?: string;
	usage: string;
	negation: string;
	position: string;
	keyPoint: string;
}

interface ModalCategory {
	id: string;
	title: string;
	description: string;
	modals?: Modal[];
	distinctions?: {
		title: string;
		explanation: string;
		comparison: Array<{
			scenario: string;
			examples: Array<{
				vietnamese: string;
				english: string;
				meaning: string;
			}>;
		}>;
	};
	examples: Example[];
	patterns?: Array<{
		pattern: string;
		meaning: string;
		explanation: string;
	}>;
}

interface NegationPatterns {
	title: string;
	description: string;
	structure: string;
	specialCases: Array<{
		modal: string;
		negation: string;
		meanings: Array<{
			context: string;
			example: string;
			english: string;
		}>;
		note: string;
	}>;
	examples: Example[];
}

function AnnotatedSentence({ example }: { example: Example }) {
	// Strip subscript numbers from display
	const stripSubscript = (text: string) => text.replace(/[₀-₉]+$/, "");

	return (
		<div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6">
			{/* Vietnamese sentence with color-coded words */}
			<div className="flex flex-wrap items-center gap-3">
				{Object.entries(example.breakdown).map(([word, info]) => (
					<div key={word} className="text-center">
						<div
							className={`font-bold text-xl ${GRAMMAR_TYPE_COLORS[info.type] || "text-white"}`}
						>
							{stripSubscript(word)}
						</div>
						<div className="mt-1 text-white/50 text-xs">{info.type}</div>
					</div>
				))}
				<SpeakButton text={example.vietnamese} size="small" />
			</div>

			{/* Breakdown with meanings */}
			<div className="grid gap-2 border-white/10 border-t pt-4">
				{Object.entries(example.breakdown).map(([word, info]) => (
					<div key={word} className="flex items-baseline gap-3 text-sm">
						<span
							className={`font-mono font-semibold ${GRAMMAR_TYPE_COLORS[info.type] || "text-white"}`}
						>
							{stripSubscript(word)}
						</span>
						<span className="text-white/40">→</span>
						<span className="text-white/70">{info.meaning}</span>
						<span className="text-white/40 text-xs italic">({info.type})</span>
					</div>
				))}
			</div>

			{/* English translation */}
			<div className="border-white/10 border-t pt-4">
				<div className="text-sm text-white/50">English:</div>
				<div className="font-semibold text-gold">{example.english}</div>
				{example.literalEnglish && (
					<div className="mt-1 text-sm text-white/50 italic">
						Literal: {example.literalEnglish}
					</div>
				)}
			</div>

			{example.notes && (
				<div className="text-sm text-white/60 italic">
					<span className="text-gold">Note:</span> {example.notes}
				</div>
			)}
		</div>
	);
}

function ModalVerbsComponent() {
	const data = modalVerbsData as unknown as {
		introduction: {
			title: string;
			content: string[];
		};
		modalCategories: ModalCategory[];
		negationPatterns: NegationPatterns;
		practiceSentences: Array<{
			vietnamese: string;
			english: string;
			category: string;
			difficulty: string;
		}>;
	};

	// Prepare practice data for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				category: sentence.category,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<
			string,
			{ meaning: string; category: string; difficulty: string }
		>,
	);

	return (
		<Layout>
			<div className="space-y-8">
				<Disclosure
					className="w-full"
					title={
						<span className="font-bold text-gold text-lg">
							Understanding Vietnamese Modal Verbs
						</span>
					}
				>
					<div className="space-y-4">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph.slice(0, 50)}>{paragraph}</p>
						))}

						<div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-4">
							<p className="font-semibold text-gold">Key Pattern:</p>
							<p className="mt-2 font-mono text-lg text-warm-cream">
								Subject + <span className="text-pink-500">MODAL</span> + Verb
							</p>
							<p className="mt-2 text-sm text-white/70">
								Modal verbs always come before the main verb in Vietnamese.
							</p>
						</div>
					</div>
				</Disclosure>

				{/* Modal Categories */}
				{data.modalCategories.map((category) => (
					<div key={category.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{category.title}
							</h2>
							<p className="mt-2 text-white/70">{category.description}</p>
						</div>

						{/* Modals Table */}
						{category.modals && (
							<div className="space-y-3">
								<h3 className="font-semibold text-lg text-white">
									Modal Verbs:
								</h3>
								<div className="grid gap-3">
									{category.modals.map((modal) => (
										<div
											key={modal.vietnamese}
											className="rounded-lg border border-white/10 bg-white/5 p-5"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-grow">
													<div className="flex items-baseline gap-3">
														<span className="font-bold text-2xl text-pink-500">
															{modal.vietnamese}
														</span>
														<span className="text-white/50">→</span>
														<span className="text-lg text-white">
															{modal.english}
														</span>
													</div>
													{modal.strength && (
														<div className="mt-2 text-sm">
															<span className="text-white/50">Strength: </span>
															<span className="font-semibold text-orange-400">
																{modal.strength}
															</span>
														</div>
													)}
													{modal.nuance && (
														<div className="mt-1 text-sm">
															<span className="text-white/50">Nuance: </span>
															<span className="text-white/70">
																{modal.nuance}
															</span>
														</div>
													)}
													<div className="mt-3 text-sm text-white/70">
														{modal.usage}
													</div>
													<div className="mt-2 grid gap-1 text-sm">
														<div>
															<span className="text-white/50">Negation: </span>
															<span className="font-mono text-rose-400">
																{modal.negation}
															</span>
														</div>
													</div>
												</div>
											</div>
											<div className="mt-3 rounded border border-gold/20 bg-gold/5 p-3">
												<span className="font-semibold text-gold text-xs">
													Key Point:
												</span>
												<p className="mt-1 text-sm text-white/80">
													{modal.keyPoint}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Distinctions Section (for ability category) */}
						{category.distinctions && (
							<div className="space-y-4 rounded-lg border-2 border-gold/40 bg-gold/10 p-6">
								<div>
									<h3 className="font-bold text-gold text-xl">
										{category.distinctions.title}
									</h3>
									<p className="mt-2 text-white/80">
										{category.distinctions.explanation}
									</p>
								</div>

								{category.distinctions.comparison.map((comp) => (
									<div
										key={comp.scenario}
										className="mt-4 rounded-lg border border-white/20 bg-white/5 p-5"
									>
										<div className="mb-3 font-semibold text-lg text-warm-cream">
											Scenario: {comp.scenario}
										</div>
										<div className="space-y-3">
											{comp.examples.map((ex) => (
												<div
													key={ex.vietnamese}
													className="rounded border border-white/10 bg-black/20 p-4"
												>
													<div className="font-mono text-lg text-pink-400">
														{ex.vietnamese}
													</div>
													<div className="mt-2 text-white/70">
														"{ex.english}"
													</div>
													<div className="mt-2 text-gold text-sm italic">
														→ {ex.meaning}
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						)}

						{/* Pattern combinations (for combinations category) */}
						{category.patterns && (
							<div className="space-y-3">
								<h3 className="font-semibold text-lg text-white">
									Common Patterns:
								</h3>
								<div className="grid gap-3">
									{category.patterns.map((pattern) => (
										<div
											key={pattern.pattern}
											className="rounded-lg border border-white/10 bg-white/5 p-4"
										>
											<div className="font-mono text-lg text-purple-400">
												{pattern.pattern}
											</div>
											<div className="mt-2 text-white">→ {pattern.meaning}</div>
											<div className="mt-1 text-sm text-white/60">
												{pattern.explanation}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Examples */}
						{category.examples && category.examples.length > 0 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">Examples:</h3>
								{category.examples.map((example) => (
									<AnnotatedSentence
										key={example.vietnamese}
										example={example}
									/>
								))}
							</div>
						)}
					</div>
				))}

				{/* Negation Patterns Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.negationPatterns.title}
						</h2>
						<p className="mt-2 text-white/70">
							{data.negationPatterns.description}
						</p>
					</div>

					<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
						<div className="font-semibold text-gold">Pattern:</div>
						<div className="mt-2 font-mono text-lg text-warm-cream">
							{data.negationPatterns.structure}
						</div>
					</div>

					{/* Special Cases */}
					{data.negationPatterns.specialCases &&
						data.negationPatterns.specialCases.length > 0 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">
									Special Cases:
								</h3>
								<div className="space-y-3">
									{data.negationPatterns.specialCases.map((specialCase) => (
										<div
											key={specialCase.modal}
											className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-5"
										>
											<div className="flex items-baseline gap-3">
												<span className="font-bold font-mono text-rose-400 text-xl">
													{specialCase.negation}
												</span>
												<span className="text-sm text-white/50">
													(from {specialCase.modal})
												</span>
											</div>
											<div className="mt-3 space-y-3">
												{specialCase.meanings.map((meaning) => (
													<div
														key={`${meaning.context}-${meaning.example}`}
														className="rounded border border-white/10 bg-black/20 p-4"
													>
														<div className="font-semibold text-orange-300 text-sm">
															{meaning.context}
														</div>
														<div className="mt-2 font-mono text-warm-cream">
															{meaning.example}
														</div>
														<div className="mt-1 text-sm text-white/70">
															→ {meaning.english}
														</div>
													</div>
												))}
											</div>
											<div className="mt-3 rounded bg-black/30 p-3 text-gold text-sm italic">
												⚠️ {specialCase.note}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

					{/* Negation Examples */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-white">Examples:</h3>
						<div className="grid gap-3">
							{data.negationPatterns.examples.map((example) => (
								<AnnotatedSentence key={example.vietnamese} example={example} />
							))}
						</div>
					</div>
				</div>

				{/* Practice Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Modal Verbs
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Practice using different modal verbs in context
						</p>
					</div>

					<PracticeGrid<{
						meaning: string;
						category: string;
						difficulty: string;
					}>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Category:
								item.category.charAt(0).toUpperCase() + item.category.slice(1),
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
