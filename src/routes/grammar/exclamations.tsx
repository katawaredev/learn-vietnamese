import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import exclamationsData from "~/data/grammar/exclamations.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/exclamations")({
	component: ExclamationsComponent,
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
}

interface Particle {
	particle: string;
	meaning: string;
	intensity: string;
	formality: string;
	position: string;
	usage: string;
	pattern: string;
	examples: Example[];
}

interface EmotionGroup {
	emotion: string;
	description: string;
	color: string;
	exclamations: Array<{
		vietnamese: string;
		english: string;
		particle: string;
		context: string;
	}>;
}

interface Interjection {
	interjection: string;
	english: string;
	usage: string;
	example: string;
	exampleEnglish: string;
}

interface AdvancedPattern {
	pattern: string;
	meaning: string;
	structure: string;
	example: Example;
}

function AnnotatedSentence({ example }: { example: Example }) {
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

function ExclamationsComponent() {
	const data = exclamationsData as unknown as {
		introduction: {
			title: string;
			content: string[];
			warning: string;
		};
		particles: Particle[];
		emotionGroups: EmotionGroup[];
		interjections: Interjection[];
		advancedPatterns: AdvancedPattern[];
		practiceSentences: Array<{
			vietnamese: string;
			english: string;
			emotion: string;
			particle: string;
			difficulty: string;
		}>;
	};

	// Color mappings for emotion groups
	const emotionColorMap: Record<string, string> = {
		emerald: "border-emerald-500/30 bg-emerald-500/5",
		amber: "border-amber-500/30 bg-amber-500/5",
		blue: "border-blue-500/30 bg-blue-500/5",
		red: "border-red-500/30 bg-red-500/5",
		pink: "border-pink-500/30 bg-pink-500/5",
	};

	const emotionTextColor: Record<string, string> = {
		emerald: "text-emerald-400",
		amber: "text-amber-400",
		blue: "text-blue-400",
		red: "text-red-400",
		pink: "text-pink-400",
	};

	// Prepare practice data
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				emotion: sentence.emotion,
				particle: sentence.particle,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<
			string,
			{ meaning: string; emotion: string; particle: string; difficulty: string }
		>,
	);

	return (
		<Layout>
			<div className="space-y-8">
				{/* Page Header */}
				<div>
					<h1 className="font-bold font-serif text-3xl text-gold">
						Exclamations & Emphasis
					</h1>
					<p className="mt-2 text-lg text-white/70">
						Express emotions naturally through particles and intonation
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

						{/* Intonation warning */}
						<div className="mt-6 rounded-lg border border-orange-500/30 bg-orange-900/20 p-4">
							<div className="flex items-start gap-3">
								<span className="text-2xl">🔊</span>
								<div>
									<div className="font-semibold text-orange-400">
										Critical for Learning:
									</div>
									<div className="mt-1 text-white/80">
										{data.introduction.warning}
									</div>
								</div>
							</div>
						</div>
					</div>
				</Disclosure>

				{/* Particle Comparison */}
				<div className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Four Main Particles
						</h2>
						<p className="mt-2 text-white/70">
							Compare intensity and formality of different exclamatory particles
						</p>
					</div>

					{/* Particle comparison table */}
					<div className="overflow-hidden rounded-lg border border-white/10">
						<table className="w-full">
							<thead className="bg-white/5">
								<tr>
									<th className="px-4 py-3 text-left font-semibold text-sm text-white">
										Particle
									</th>
									<th className="px-4 py-3 text-left font-semibold text-sm text-white">
										Meaning
									</th>
									<th className="px-4 py-3 text-left font-semibold text-sm text-white">
										Intensity
									</th>
									<th className="px-4 py-3 text-left font-semibold text-sm text-white">
										Formality
									</th>
									<th className="px-4 py-3 text-left font-semibold text-sm text-white">
										Position
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/10">
								{data.particles.map((particle) => (
									<tr key={particle.particle} className="hover:bg-white/5">
										<td className="px-4 py-3 font-bold font-mono text-lg text-orange-400">
											{particle.particle}
										</td>
										<td className="px-4 py-3 text-sm text-white/70">
											{particle.meaning}
										</td>
										<td className="px-4 py-3 text-sm">
											<span
												className={
													particle.intensity === "Very High"
														? "text-red-400"
														: particle.intensity === "High"
															? "text-orange-400"
															: particle.intensity === "Medium-High"
																? "text-yellow-400"
																: "text-green-400"
												}
											>
												{particle.intensity}
											</span>
										</td>
										<td className="px-4 py-3 text-sm text-white/70">
											{particle.formality}
										</td>
										<td className="px-4 py-3 text-white/60 text-xs">
											{particle.position}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Detailed particle sections */}
					{data.particles.map((particle) => (
						<div
							key={particle.particle}
							className="space-y-4 rounded-lg border border-gold/30 bg-gold/5 p-6"
						>
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<span className="font-bold text-3xl text-orange-500">
										{particle.particle}
									</span>
									<SpeakButton text={particle.particle} size="small" />
								</div>
								<div className="text-right text-sm">
									<div className="text-white/60">{particle.formality}</div>
									<div
										className={
											particle.intensity === "Very High"
												? "text-red-400"
												: particle.intensity === "High"
													? "text-orange-400"
													: particle.intensity === "Medium-High"
														? "text-yellow-400"
														: "text-green-400"
										}
									>
										{particle.intensity} intensity
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<div className="font-mono text-sm text-white/60">
									Pattern: {particle.pattern}
								</div>
								<p className="text-white/80">{particle.usage}</p>
							</div>

							<div className="space-y-4">
								{particle.examples.map((example) => (
									<AnnotatedSentence
										key={example.vietnamese}
										example={example}
									/>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Emotion Groups */}
				<div className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Exclamations by Emotion
						</h2>
						<p className="mt-2 text-white/70">
							Common exclamatory phrases grouped by emotional context
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						{data.emotionGroups.map((group) => (
							<div
								key={group.emotion}
								className={`space-y-4 rounded-lg border p-6 ${emotionColorMap[group.color] || "border-white/10 bg-white/5"}`}
							>
								<div>
									<h3
										className={`font-bold text-xl ${emotionTextColor[group.color] || "text-white"}`}
									>
										{group.emotion}
									</h3>
									<p className="text-sm text-white/60">{group.description}</p>
								</div>

								<div className="space-y-3">
									{group.exclamations.map((exclamation) => (
										<div
											key={exclamation.vietnamese}
											className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-4"
										>
											<div className="flex items-center gap-2">
												<span className="font-bold text-lg text-warm-cream">
													{exclamation.vietnamese}
												</span>
												<SpeakButton
													text={exclamation.vietnamese}
													size="small"
												/>
											</div>
											<div className="text-gold text-sm">
												{exclamation.english}
											</div>
											<div className="flex items-center justify-between gap-2 text-xs">
												<span className="text-white/50">
													{exclamation.context}
												</span>
												<span className="text-orange-400">
													{exclamation.particle}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Interjections */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Common Interjections
						</h2>
						<p className="mt-2 text-white/70">
							Quick emotional reactions and sounds
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{data.interjections.map((interjection) => (
							<div
								key={interjection.interjection}
								className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-5"
							>
								<div className="flex items-center gap-2">
									<span className="font-bold text-2xl text-rose-500">
										{interjection.interjection}
									</span>
									<SpeakButton text={interjection.interjection} size="small" />
								</div>
								<div className="font-semibold text-sm text-white/80">
									{interjection.english}
								</div>
								<div className="text-white/60 text-xs">
									{interjection.usage}
								</div>
								<div className="space-y-1 border-white/10 border-t pt-3">
									<div className="flex items-center gap-2">
										<span className="font-mono text-sm text-warm-cream">
											{interjection.example}
										</span>
										<SpeakButton text={interjection.example} size="small" />
									</div>
									<div className="text-white/50 text-xs italic">
										{interjection.exampleEnglish}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Advanced Patterns */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Advanced Patterns
						</h2>
						<p className="mt-2 text-white/70">
							Rhetorical and literary exclamation structures
						</p>
					</div>

					{data.advancedPatterns.map((pattern) => (
						<div
							key={pattern.pattern}
							className="space-y-4 rounded-lg border border-purple-500/30 bg-purple-500/5 p-6"
						>
							<div>
								<div className="font-bold text-lg text-purple-400">
									{pattern.pattern}
								</div>
								<div className="mt-1 text-sm text-white/60">
									{pattern.structure}
								</div>
								<div className="mt-1 font-semibold text-sm text-white/80">
									Meaning: {pattern.meaning}
								</div>
							</div>

							<AnnotatedSentence example={pattern.example} />
						</div>
					))}
				</div>

				{/* Practice Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Exclamations
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Practice expressing different emotions with proper particles
						</p>
					</div>

					<PracticeGrid<{
						meaning: string;
						emotion: string;
						particle: string;
						difficulty: string;
					}>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Emotion: (
								<span className="capitalize">
									{item.emotion.replace(/-/g, " ")}
								</span>
							),
							Particle: (
								<span className="text-orange-400">{item.particle}</span>
							),
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
