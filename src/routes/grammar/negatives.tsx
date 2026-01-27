import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import data from "~/data/grammar/negatives.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/negatives")({
	component: NegativesComponent,
});

interface CommonMistake {
	wrong: string;
	right: string;
	explanation: string;
}

interface NegationType {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	pattern: {
		structure: string;
		template: string;
	};
	keyPoints: string[];
	examples: Example[];
	commonMistakes: CommonMistake[];
}

function NegationTypeSection({ negation }: { negation: NegationType }) {
	return (
		<div className="space-y-4">
			{/* Header */}
			<div>
				<h2 className="font-bold font-serif text-2xl text-gold">
					{negation.title}
				</h2>
				<div className="text-lg text-white/80">{negation.subtitle}</div>
			</div>

			{/* Description */}
			<p className="text-white/70">{negation.description}</p>

			{/* Pattern */}
			<div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
				<div className="font-semibold text-gold">Pattern:</div>
				<div className="mt-2 font-mono text-lg text-warm-cream">
					{negation.pattern.structure}
				</div>
				<div className="mt-1 font-mono text-sm text-white/50">
					{negation.pattern.template}
				</div>
			</div>

			{/* Key Points */}
			<div className="space-y-2">
				<div className="font-semibold text-white/90">Key Points:</div>
				<ul className="ml-6 list-disc space-y-1 text-white/70">
					{negation.keyPoints.map((point) => (
						<li key={point}>{point}</li>
					))}
				</ul>
			</div>

			{/* Examples */}
			<div className="space-y-4">
				<div className="font-semibold text-white/90">Examples:</div>
				<GrammarPracticeGrid examples={negation.examples} />
			</div>

			{/* Common Mistakes */}
			{negation.commonMistakes && negation.commonMistakes.length > 0 && (
				<div className="space-y-2">
					<div className="font-semibold text-red-400">Common Mistakes:</div>
					{negation.commonMistakes.map((mistake) => (
						<div
							key={mistake.wrong}
							className="rounded-lg border border-red-400/30 bg-red-900/10 p-3"
						>
							<div className="space-y-1">
								<div className="text-red-300">
									<span className="font-semibold">❌ Wrong:</span>{" "}
									{mistake.wrong}
								</div>
								<div className="text-green-300">
									<span className="font-semibold">✓ Right:</span>{" "}
									{mistake.right}
								</div>
								<div className="text-sm text-white/70">
									{mistake.explanation}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function NegativesComponent() {
	// Transform practice sentences array to object format required by PracticeGrid
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
				{/* Page Title */}
				<div>
					<h1 className="font-bold font-serif text-3xl text-gold">
						Negative Sentences
					</h1>
					<p className="mt-2 text-lg text-white/70">
						Master the three main negation patterns in Vietnamese: không, không
						phải là, and chưa
					</p>
				</div>

				{/* Introduction */}
				<Disclosure title={data.introduction.title}>
					{data.introduction.content.map((paragraph) => (
						<p
							key={paragraph.slice(0, 50)}
							className="mb-4 text-white/80 last:mb-0"
						>
							{paragraph}
						</p>
					))}
				</Disclosure>

				{/* Three Main Negation Types */}
				{data.negationTypes.map((negationType) => (
					<NegationTypeSection
						key={negationType.id}
						negation={negationType as unknown as NegationType}
					/>
				))}

				{/* Comparison Table */}
				<div className="space-y-4 border-white/10 border-t pt-8">
					<h2 className="font-bold font-serif text-2xl text-gold">
						Quick Comparison
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-gold/30 border-b-2">
									<th className="p-3 text-left text-gold">Negation Form</th>
									<th className="p-3 text-left text-gold">Usage</th>
									<th className="p-3 text-left text-gold">Meaning</th>
									<th className="p-3 text-left text-gold">Example</th>
									<th className="p-3 text-left text-gold">Translation</th>
									<th className="p-3 text-left text-gold">Implication</th>
								</tr>
							</thead>
							<tbody>
								{data.comparisonTable.map((row) => (
									<tr
										key={row.negationForm}
										className="border-white/10 border-b"
									>
										<td className="p-3 font-semibold text-warm-cream">
											{row.negationForm}
										</td>
										<td className="p-3 text-white/70">{row.usage}</td>
										<td className="p-3 text-white/70">{row.meaning}</td>
										<td className="p-3 font-medium text-warm-cream">
											{row.example}
										</td>
										<td className="p-3 text-white/70">{row.translation}</td>
										<td className="p-3 text-sm text-white/60">
											{row.implication}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Advanced Negations */}
				<div className="space-y-4 border-white/10 border-t pt-8">
					<h2 className="font-bold font-serif text-2xl text-gold">
						Advanced Negation Words
					</h2>
					<p className="text-white/70">
						Beyond the three main forms, Vietnamese has several specialized
						negation words and phrases:
					</p>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{data.advancedNegations.map((neg) => (
							<div
								key={neg.word}
								className="rounded-lg border border-white/10 bg-white/5 p-4"
							>
								<div className="font-bold text-lg text-warm-cream">
									{neg.word}
								</div>
								<div className="mt-1 text-sm text-white/60">{neg.tone}</div>
								<div className="mt-2 text-white/80">{neg.meaning}</div>
								<div className="mt-3 space-y-1 border-white/10 border-t pt-3">
									<div className="font-medium text-warm-cream">
										{neg.example}
									</div>
									<div className="flex items-center gap-2">
										<SpeakButton text={neg.example} />
										<span className="text-sm text-white/60">
											{neg.translation}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Practice Section */}
				<div className="space-y-4 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Sentences
						</h2>
						<p className="mt-2 text-white/70">
							Practice different negation forms across various difficulty levels
						</p>
					</div>
					<PracticeGrid data={practiceData} />
				</div>
			</div>
		</Layout>
	);
}
