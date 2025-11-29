import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import data from "~/data/grammar/negatives.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/negatives")({
	component: NegativesComponent,
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
	comparison?: string;
}

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

/**
 * Removes subscript numbers from Vietnamese words (e.g., "biết₁" → "biết")
 * Used for tracking multiple instances of the same word in breakdown annotations
 */
function stripSubscript(word: string): string {
	return word.replace(/[₀-₉]+$/, "");
}

function AnnotatedSentence({ example }: { example: Example }) {
	const words = Object.keys(example.breakdown);

	return (
		<div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
			{/* Vietnamese sentence with word-by-word breakdown */}
			<div className="space-y-2">
				<div className="flex flex-wrap items-start gap-x-4 gap-y-2">
					{words.map((word) => {
						const item = example.breakdown[word];
						const displayWord = stripSubscript(word);
						const colorClass =
							GRAMMAR_TYPE_COLORS[item.type] || "text-gray-400";

						return (
							<div key={word} className="flex flex-col items-center">
								<div className="font-medium text-lg text-warm-cream">
									{displayWord}
								</div>
								<div className={`text-xs ${colorClass}`}>{item.type}</div>
							</div>
						);
					})}
					<SpeakButton text={example.vietnamese} />
				</div>
			</div>

			{/* Breakdown table */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-white/10 border-b">
							<th className="py-2 pr-4 text-left font-medium text-warm-cream">
								Vietnamese
							</th>
							<th className="px-4 py-2 text-left font-medium text-warm-cream">
								Type
							</th>
							<th className="py-2 pl-4 text-left font-medium text-warm-cream">
								Meaning
							</th>
						</tr>
					</thead>
					<tbody>
						{words.map((word) => {
							const item = example.breakdown[word];
							const displayWord = stripSubscript(word);
							const colorClass =
								GRAMMAR_TYPE_COLORS[item.type] || "text-gray-400";

							return (
								<tr key={word} className="border-white/10 border-b">
									<td className="py-2 pr-4 font-medium text-warm-cream">
										{displayWord}
									</td>
									<td className={`px-4 py-2 ${colorClass}`}>{item.type}</td>
									<td className="py-2 pl-4 text-white/70">{item.meaning}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Translations */}
			<div className="space-y-1 border-white/10 border-t pt-3">
				<div className="text-white/90">
					<span className="font-semibold">English:</span> {example.english}
				</div>
				{example.literalEnglish && (
					<div className="text-sm text-white/60">
						<span className="font-semibold">Literal:</span>{" "}
						{example.literalEnglish}
					</div>
				)}
				{example.notes && (
					<div className="text-blue-300 text-sm">
						<span className="font-semibold">Note:</span> {example.notes}
					</div>
				)}
				{example.comparison && (
					<div className="text-green-300 text-sm">
						<span className="font-semibold">Compare:</span> {example.comparison}
					</div>
				)}
			</div>
		</div>
	);
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
				{negation.examples.map((example) => (
					<AnnotatedSentence key={example.vietnamese} example={example} />
				))}
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
