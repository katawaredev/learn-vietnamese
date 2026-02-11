import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import passiveVoiceData from "~/data/grammar/passive-voice.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/passive-voice")({
	component: PassiveVoiceComponent,
});

interface PassiveMarker {
	marker: string;
	meaning: string;
	evaluation: string;
	pattern: string;
	commonWith: string[];
}

interface PassiveSection {
	id: string;
	title: string;
	description: string;
	pattern: string;
	keyPoint?: string;
	examples: Example[];
}

interface Comparison {
	context: string;
	examples: Example[];
}

interface TenseCombination {
	tense: string;
	description: string;
	examples: Example[];
}

interface SpecialNote {
	topic: string;
	explanation: string;
	examples: string[];
}

interface PassiveVoiceData {
	introduction: {
		title: string;
		content: string[];
	};
	basicStructure: {
		title: string;
		description: string;
		markers: PassiveMarker[];
	};
	positivePassive: PassiveSection;
	negativePassive: PassiveSection;
	semanticDistinction: {
		title: string;
		description: string;
		comparisons: Comparison[];
	};
	tenseIntegration: {
		title: string;
		description: string;
		combinations: TenseCombination[];
	};
	specialNotes: {
		title: string;
		notes: SpecialNote[];
	};
	practiceSentences: Array<{
		vietnamese: string;
		english: string;
		type: string;
		difficulty: string;
		marker: string;
	}>;
}

const data = passiveVoiceData as unknown as PassiveVoiceData;

function PassiveVoiceComponent() {
	// Prepare practice data for PracticeGrid
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				type: sentence.type,
				difficulty: sentence.difficulty,
				marker: sentence.marker,
			};
			return acc;
		},
		{} as Record<
			string,
			{ meaning: string; type: string; difficulty: string; marker: string }
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

	// Get marker color
	const getMarkerColor = (marker: string) => {
		if (marker.includes("được")) return "text-emerald-500";
		if (marker.includes("bị")) return "text-red-500";
		return "text-white/70";
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
					<div className="space-y-4">
						{data.introduction.content.map((paragraph, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: content is static text without unique identifiers
							<p key={idx} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Basic Structure: Two Markers */}
				<section className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.basicStructure.title}
						</h2>
						<p className="mt-1 text-white/60">
							{data.basicStructure.description}
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{data.basicStructure.markers.map((marker) => {
							const isPositive = marker.marker === "được";
							const borderColor = isPositive
								? "border-emerald-500/30"
								: "border-red-500/30";
							const bgColor = isPositive
								? "bg-emerald-500/10"
								: "bg-red-500/10";
							const accentColor = isPositive
								? "text-emerald-400"
								: "text-red-400";

							return (
								<Card
									key={marker.marker}
									className={`${borderColor} ${bgColor}`}
								>
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className={`font-bold text-3xl ${accentColor}`}>
												{marker.marker}
											</div>
											<SpeakButton text={marker.marker} size="small" />
										</div>

										<div className="space-y-2 text-sm">
											<div>
												<span className="font-semibold text-gold">
													Meaning:{" "}
												</span>
												<span className="text-white/80">{marker.meaning}</span>
											</div>
											<div>
												<span className="font-semibold text-gold">
													Evaluation:{" "}
												</span>
												<span className="text-white/80">
													{marker.evaluation}
												</span>
											</div>
											<div className="rounded border border-white/10 bg-black/20 p-2">
												<span className="font-semibold text-gold">
													Pattern:{" "}
												</span>
												<span className="font-mono text-white/80 text-xs">
													{marker.pattern}
												</span>
											</div>
										</div>

										<div className="border-white/10 border-t pt-3">
											<div className="mb-2 font-semibold text-sm text-white/80">
												Common verbs:
											</div>
											<div className="flex flex-wrap gap-1.5">
												{marker.commonWith.map((verb) => (
													<span
														key={verb}
														className="rounded bg-white/10 px-2 py-1 font-mono text-white/70 text-xs"
													>
														{verb}
													</span>
												))}
											</div>
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</section>

				{/* Positive Passive Section */}
				<section className="space-y-6">
					<div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 p-6">
						<div className="space-y-3">
							<h2 className="font-bold font-serif text-2xl text-emerald-400">
								{data.positivePassive.title}
							</h2>
							<p className="text-white/80">
								{data.positivePassive.description}
							</p>

							<div className="grid gap-3 text-sm">
								<div className="rounded border border-white/10 bg-black/20 p-3">
									<span className="font-semibold text-gold">Pattern: </span>
									<span className="font-mono text-white/90">
										{data.positivePassive.pattern}
									</span>
								</div>
								{data.positivePassive.keyPoint && (
									<div className="rounded border-2 border-emerald-400/40 bg-emerald-400/10 p-3">
										<span className="font-semibold text-emerald-400">
											💡 Key Point:{" "}
										</span>
										<span className="text-white/90">
											{data.positivePassive.keyPoint}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Examples */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-white">Examples:</h3>
						<GrammarPracticeGrid examples={data.positivePassive.examples} />
					</div>
				</section>

				{/* Negative Passive Section */}
				<section className="space-y-6">
					<div className="rounded-lg border-2 border-red-500/50 bg-red-500/10 p-6">
						<div className="space-y-3">
							<h2 className="font-bold font-serif text-2xl text-red-400">
								{data.negativePassive.title}
							</h2>
							<p className="text-white/80">
								{data.negativePassive.description}
							</p>

							<div className="grid gap-3 text-sm">
								<div className="rounded border border-white/10 bg-black/20 p-3">
									<span className="font-semibold text-gold">Pattern: </span>
									<span className="font-mono text-white/90">
										{data.negativePassive.pattern}
									</span>
								</div>
								{data.negativePassive.keyPoint && (
									<div className="rounded border-2 border-red-400/40 bg-red-400/10 p-3">
										<span className="font-semibold text-red-400">
											💡 Key Point:{" "}
										</span>
										<span className="text-white/90">
											{data.negativePassive.keyPoint}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Examples */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-white">Examples:</h3>
						<GrammarPracticeGrid examples={data.negativePassive.examples} />
					</div>
				</section>

				{/* Semantic Distinction Section */}
				<section className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.semanticDistinction.title}
						</h2>
						<p className="mt-1 text-white/60">
							{data.semanticDistinction.description}
						</p>
					</div>

					{data.semanticDistinction.comparisons.map((comparison) => (
						<div key={comparison.context} className="space-y-4">
							<h3 className="font-semibold text-lg text-purple-400">
								{comparison.context}
							</h3>

							<GrammarPracticeGrid examples={comparison.examples} />
						</div>
					))}
				</section>

				{/* Tense Integration Section */}
				<section className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.tenseIntegration.title}
						</h2>
						<p className="mt-1 text-white/60">
							{data.tenseIntegration.description}
						</p>
					</div>

					{data.tenseIntegration.combinations.map((combo) => (
						<div key={combo.tense} className="space-y-3">
							<Card className="border-orange-500/30 bg-orange-500/10">
								<h3 className="font-bold text-lg text-orange-400">
									{combo.tense}
								</h3>
								<p className="text-sm text-white/70">{combo.description}</p>
							</Card>

							<div className="grid gap-4 md:grid-cols-2">
								<GrammarPracticeGrid examples={combo.examples} />
							</div>
						</div>
					))}
				</section>

				{/* Special Notes Section */}
				<section className="space-y-4 border-white/10 border-t pt-8">
					<h2 className="font-bold font-serif text-2xl text-gold">
						{data.specialNotes.title}
					</h2>

					<div className="grid gap-4 md:grid-cols-2">
						{data.specialNotes.notes.map((note) => (
							<Card
								key={note.topic}
								className="border-blue-500/20 bg-blue-500/5"
							>
								<div className="space-y-3">
									<h3 className="font-semibold text-blue-400 text-lg">
										{note.topic}
									</h3>
									<p className="text-sm text-white/70">{note.explanation}</p>

									<div className="space-y-2 border-white/10 border-t pt-3">
										<div className="font-semibold text-sm text-white/60">
											Examples:
										</div>
										<ul className="ml-4 list-disc space-y-1 text-sm text-white/60">
											{note.examples.map((ex) => (
												<li key={ex}>{ex}</li>
											))}
										</ul>
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Practice Section */}
				<section className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Sentences
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Practice distinguishing between được (positive) and bị (negative)
							passive
						</p>
					</div>

					<PracticeGrid<{
						meaning: string;
						type: string;
						difficulty: string;
						marker: string;
					}>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Marker: (
								<span className={`font-bold ${getMarkerColor(item.marker)}`}>
									{item.marker}
								</span>
							),
							Type: (
								<span className="text-purple-400 capitalize">{item.type}</span>
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
