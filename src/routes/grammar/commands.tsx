import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import commandsData from "~/data/grammar/commands.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/commands")({
	component: CommandsComponent,
});

interface CommandType {
	id: string;
	title: string;
	description: string;
	pattern?: {
		structure: string;
		template: string;
	};
	warning?: string;
	keyPoints?: string[];
	examples?: Example[];
	politenessMarkers?: Array<{
		marker: string;
		formality: string;
		meaning: string;
		usage: string;
		position: string;
		example: Example;
	}>;
	particles?: Array<{
		particle: string;
		function: string;
		effect: string;
		position: string;
		examples: Array<{
			command: string;
			english: string;
			notes: string;
		}>;
	}>;
}

interface PolitenessLevel {
	level: string;
	vietnamese: string;
	context: string;
	appropriate: string;
}

function CommandsComponent() {
	const data = commandsData as unknown as {
		introduction: {
			title: string;
			content: string[];
		};
		commandTypes: CommandType[];
		politenessComparison: {
			title: string;
			description: string;
			examples: Array<{
				english: string;
				levels: PolitenessLevel[];
			}>;
		};
		practiceSentences: Array<{
			vietnamese: string;
			english: string;
			type: string;
			difficulty: string;
			context: string;
		}>;
	};

	// Prepare practice data for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				type: sentence.type,
				difficulty: sentence.difficulty,
				context: sentence.context,
			};
			return acc;
		},
		{} as Record<
			string,
			{ meaning: string; type: string; difficulty: string; context: string }
		>,
	);

	return (
		<Layout>
			<div className="space-y-8">
				{/* Page Header */}
				<div>
					<h1 className="font-bold font-serif text-3xl text-gold">
						Commands & Imperatives
					</h1>
					<p className="mt-2 text-lg text-white/70">
						Simple structure, complex politeness—choosing the right command form
						is critical in Vietnamese culture
					</p>
				</div>

				{/* Introduction */}
				<Disclosure
					className="w-full"
					title={
						<span className="font-bold text-gold text-lg">
							{data.introduction.title}
						</span>
					}
				>
					<div className="space-y-4">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph.slice(0, 50)} className="leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Command Types Sections */}
				{data.commandTypes.map((type) => (
					<div key={type.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{type.title}
							</h2>
							<p className="mt-2 text-white/70">{type.description}</p>
						</div>

						{/* Warning if present */}
						{type.warning && (
							<div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
								<div className="flex items-start gap-3">
									<span className="text-2xl">⚠️</span>
									<div>
										<div className="font-semibold text-red-400">
											Cultural Note:
										</div>
										<div className="mt-1 text-white/80">{type.warning}</div>
									</div>
								</div>
							</div>
						)}

						{/* Pattern */}
						{type.pattern && (
							<div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
								<div className="font-semibold text-gold">Pattern:</div>
								<div className="mt-2 font-mono text-lg text-warm-cream">
									{type.pattern.structure}
								</div>
								<div className="mt-1 font-mono text-sm text-white/50">
									{type.pattern.template}
								</div>
							</div>
						)}

						{/* Key Points */}
						{type.keyPoints && (
							<div className="space-y-2">
								<div className="font-semibold text-white/90">Key Points:</div>
								<ul className="ml-6 list-disc space-y-1 text-white/70">
									{type.keyPoints.map((point) => (
										<li key={point}>{point}</li>
									))}
								</ul>
							</div>
						)}

						{/* Politeness Markers (for polite commands) */}
						{type.politenessMarkers && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">
									Politeness Markers:
								</h3>
								<div className="grid gap-4">
									{type.politenessMarkers.map((marker) => (
										<div
											key={marker.marker}
											className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-5"
										>
											<div className="flex items-start justify-between gap-4">
												<div>
													<div className="font-bold text-purple-400 text-xl">
														{marker.marker}
													</div>
													<div className="text-sm text-white/50">
														{marker.formality}
													</div>
												</div>
												<div className="text-right">
													<div className="text-sm text-white/60">
														Position: {marker.position}
													</div>
												</div>
											</div>

											<div className="space-y-2 border-white/10 border-t pt-3">
												<div className="text-sm">
													<span className="font-semibold text-white/80">
														Meaning:
													</span>{" "}
													<span className="text-white/70">
														{marker.meaning}
													</span>
												</div>
												<div className="text-sm">
													<span className="font-semibold text-white/80">
														Usage:
													</span>{" "}
													<span className="text-white/70">{marker.usage}</span>
												</div>
											</div>

											<div className="border-white/10 border-t pt-3">
												<div className="mb-2 font-semibold text-sm text-white/80">
													Example:
												</div>
												<GrammarPracticeGrid examples={[marker.example]} />
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Command Particles (for particles section) */}
						{type.particles && (
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									{type.particles.map((particle) => (
										<div
											key={particle.particle}
											className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4"
										>
											<div>
												<div className="font-bold text-lg text-orange-400">
													{particle.particle}
												</div>
												<div className="text-sm text-white/60">
													{particle.function}
												</div>
											</div>

											<div className="space-y-2 border-white/10 border-t pt-3 text-sm">
												<div>
													<span className="font-semibold text-white/80">
														Effect:
													</span>{" "}
													<span className="text-white/70">
														{particle.effect}
													</span>
												</div>
												<div>
													<span className="font-semibold text-white/80">
														Position:
													</span>{" "}
													<span className="text-white/70">
														{particle.position}
													</span>
												</div>
											</div>

											<div className="space-y-2 border-white/10 border-t pt-3">
												{particle.examples.map((ex) => (
													<div
														key={ex.command}
														className="space-y-1 rounded bg-black/20 p-3"
													>
														<div className="flex items-center gap-2">
															<span className="font-semibold text-warm-cream">
																{ex.command}
															</span>
															<SpeakButton text={ex.command} size="small" />
														</div>
														<div className="text-gold text-sm">
															{ex.english}
														</div>
														<div className="text-white/50 text-xs italic">
															{ex.notes}
														</div>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Regular Examples */}
						{type.examples && type.examples.length > 0 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg text-white">Examples:</h3>
								<GrammarPracticeGrid examples={type.examples} />
							</div>
						)}
					</div>
				))}

				{/* Politeness Comparison Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.politenessComparison.title}
						</h2>
						<p className="mt-2 text-white/70">
							{data.politenessComparison.description}
						</p>
					</div>

					{data.politenessComparison.examples.map((comparison) => (
						<div
							key={comparison.english}
							className="space-y-3 rounded-lg border border-gold/30 bg-gold/5 p-6"
						>
							<div className="font-bold text-lg text-white">
								"{comparison.english}"
							</div>

							<div className="space-y-2">
								{comparison.levels.map((level) => (
									<div
										key={level.level}
										className="flex items-start gap-4 rounded-lg border border-white/10 bg-black/20 p-4"
									>
										<div className="w-32 shrink-0">
											<div className="font-semibold text-sm text-white/60">
												{level.level}
											</div>
										</div>
										<div className="grow space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-bold text-lg text-warm-cream">
													{level.vietnamese}
												</span>
												<SpeakButton text={level.vietnamese} size="small" />
											</div>
											<div className="text-sm text-white/70">
												<span className="font-semibold">Context:</span>{" "}
												{level.context}
											</div>
											<div className="text-white/50 text-xs">
												<span className="font-semibold">Use:</span>{" "}
												{level.appropriate}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Practice Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Commands
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Practice different command types and politeness levels
						</p>
					</div>

					<PracticeGrid<{
						meaning: string;
						type: string;
						difficulty: string;
						context: string;
					}>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Type: (
								<span className="text-sm">
									{item.type
										.split("-")
										.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
										.join(" ")}
								</span>
							),
							Context: <span className="italic">{item.context}</span>,
							Difficulty: (
								<span
									className={
										item.difficulty === "beginner"
											? "text-green-400"
											: item.difficulty === "intermediate"
												? "text-yellow-400"
												: "text-red-400"
									}
								>
									{item.difficulty.charAt(0).toUpperCase() +
										item.difficulty.slice(1)}
								</span>
							),
						})}
					/>
				</div>
			</div>
		</Layout>
	);
}
