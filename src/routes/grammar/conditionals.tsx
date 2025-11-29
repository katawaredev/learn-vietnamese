import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import conditionalsData from "~/data/grammar/conditionals.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/conditionals")({
	component: ConditionalsComponent,
});

// Types matching the JSON structure
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

interface Component {
	word: string;
	meaning: string;
	usage: string;
}

interface ConditionalType {
	id: string;
	title: string;
	description: string;
	pattern: string;
	whenToUse: string;
	keyPoint?: string;
	examples: Example[];
}

interface AlternativeWord {
	vietnamese: string;
	english: string;
	usage: string;
	formality: string;
	example: string;
	exampleEnglish: string;
}

interface Variation {
	pattern: string;
	description: string;
	vietnamese: string;
	english: string;
	notes: string;
}

interface ConditionalsData {
	introduction: {
		title: string;
		content: string[];
	};
	basicStructure: {
		title: string;
		description: string;
		structure: string;
		components: Component[];
		examples: Example[];
	};
	conditionalTypes: ConditionalType[];
	alternativeWords: {
		title: string;
		description: string;
		words: AlternativeWord[];
	};
	variations: {
		title: string;
		description: string;
		examples: Variation[];
	};
	practiceSentences: Array<{
		vietnamese: string;
		english: string;
		type: string;
		difficulty: string;
	}>;
}

const data = conditionalsData as unknown as ConditionalsData;

// Helper to strip subscript numbers
const stripSubscript = (text: string) => text.replace(/[₀-₉]+$/, "");

// Component for annotated sentence examples
function AnnotatedSentence({ example }: { example: Example }) {
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

			{/* Word-by-word breakdown */}
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

			{/* Optional notes */}
			{example.notes && (
				<div className="text-sm text-white/60 italic">
					<span className="text-gold">Note:</span> {example.notes}
				</div>
			)}
		</div>
	);
}

function ConditionalsComponent() {
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

	return (
		<Layout>
			<div className="space-y-8">
				{/* Header */}
				<div>
					<h1 className="font-bold font-serif text-3xl text-gold">
						Conditional Sentences
					</h1>
					<p className="mt-2 text-white/60">
						Vietnamese conditionals use 'Nếu...thì' to express if-then
						relationships
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
						{data.introduction.content.map((paragraph, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: content is static text without unique identifiers
							<p key={idx} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Basic Structure Section */}
				<section className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.basicStructure.title}
						</h2>
						<p className="mt-1 text-white/60">
							{data.basicStructure.description}
						</p>
					</div>

					{/* Structure pattern box */}
					<div className="rounded-lg border-2 border-gold/50 bg-gold/10 p-6">
						<div className="text-center font-mono text-gold text-xl">
							{data.basicStructure.structure}
						</div>
					</div>

					{/* Components explanation */}
					<div className="grid gap-4 md:grid-cols-2">
						{data.basicStructure.components.map((component) => (
							<Card
								key={component.word}
								className="border-purple-500/30 bg-purple-500/10"
							>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="font-bold text-2xl text-purple-400">
											{component.word}
										</span>
										<SpeakButton text={component.word} size="small" />
									</div>
									<div className="text-sm text-white/70">
										<span className="font-semibold text-gold">Meaning:</span>{" "}
										{component.meaning}
									</div>
									<div className="text-sm text-white/70">
										<span className="font-semibold text-gold">Usage:</span>{" "}
										{component.usage}
									</div>
								</div>
							</Card>
						))}
					</div>

					{/* Examples */}
					<div className="space-y-4">
						{data.basicStructure.examples.map((example) => (
							<AnnotatedSentence key={example.vietnamese} example={example} />
						))}
					</div>
				</section>

				{/* Conditional Types Section */}
				<section className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Three Types of Conditionals
						</h2>
						<p className="mt-1 text-white/60">
							Understanding when to use each type is key to natural Vietnamese
						</p>
					</div>

					{data.conditionalTypes.map((type, index) => {
						// Assign different color schemes for each type
						const colors = [
							{
								border: "border-green-500/30",
								bg: "bg-green-500/10",
								accent: "text-green-400",
							},
							{
								border: "border-red-500/30",
								bg: "bg-red-500/10",
								accent: "text-red-400",
							},
							{
								border: "border-blue-500/30",
								bg: "bg-blue-500/10",
								accent: "text-blue-400",
							},
						][index];

						return (
							<div key={type.id} className="space-y-4">
								<Card
									className={`${colors.border} ${colors.bg}`}
									key={`${type.id}-header`}
								>
									<div className="space-y-3">
										<h3
											className={`font-bold font-serif text-2xl ${colors.accent}`}
										>
											{type.title}
										</h3>
										<p className="text-white/80">{type.description}</p>

										<div className="grid gap-3 text-sm">
											<div className="rounded border border-white/10 bg-black/20 p-3">
												<span className="font-semibold text-gold">
													Pattern:{" "}
												</span>
												<span className="font-mono text-white/90">
													{type.pattern}
												</span>
											</div>
											<div className="rounded border border-white/10 bg-black/20 p-3">
												<span className="font-semibold text-gold">
													When to use:{" "}
												</span>
												<span className="text-white/90">{type.whenToUse}</span>
											</div>
											{type.keyPoint && (
												<div className="rounded border-2 border-gold/40 bg-gold/10 p-3">
													<span className="font-semibold text-gold">
														⚠️ Key Point:{" "}
													</span>
													<span className="text-white/90">{type.keyPoint}</span>
												</div>
											)}
										</div>
									</div>
								</Card>

								{/* Examples for this type */}
								<div className="space-y-4">
									{type.examples.map((example) => (
										<AnnotatedSentence
											key={example.vietnamese}
											example={example}
										/>
									))}
								</div>
							</div>
						);
					})}
				</section>

				{/* Alternative Words Section */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.alternativeWords.title}
						</h2>
						<p className="mt-1 text-white/60">
							{data.alternativeWords.description}
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{data.alternativeWords.words.map((word) => (
							<Card
								key={word.vietnamese}
								className="border-orange-500/20 bg-orange-500/5"
							>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-bold text-orange-400 text-xl">
												{word.vietnamese}
											</span>
											<SpeakButton text={word.vietnamese} size="small" />
										</div>
										<span
											className={`rounded px-2 py-1 text-xs ${
												word.formality === "formal"
													? "bg-purple-500/20 text-purple-300"
													: "bg-blue-500/20 text-blue-300"
											}`}
										>
											{word.formality}
										</span>
									</div>

									<div className="space-y-2 text-sm">
										<div className="text-white/80">
											<span className="font-semibold text-gold">Meaning: </span>
											{word.english}
										</div>
										<div className="text-white/80">
											<span className="font-semibold text-gold">Usage: </span>
											{word.usage}
										</div>
									</div>

									<div className="space-y-1 border-white/10 border-t pt-3">
										<div className="flex items-center gap-2">
											<span className="font-medium text-warm-cream">
												{word.example}
											</span>
											<SpeakButton text={word.example} size="small" />
										</div>
										<div className="text-white/50 text-xs">
											{word.exampleEnglish}
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				</section>

				{/* Variations Section */}
				<section className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.variations.title}
						</h2>
						<p className="mt-1 text-white/60">{data.variations.description}</p>
					</div>

					<div className="space-y-3">
						{data.variations.examples.map((variation) => (
							<Card
								key={variation.pattern}
								className="border-cyan-500/20 bg-cyan-500/5"
							>
								<div className="space-y-3">
									<div>
										<h3 className="font-semibold text-cyan-400 text-lg">
											{variation.pattern}
										</h3>
										<p className="text-sm text-white/70">
											{variation.description}
										</p>
									</div>

									<div className="space-y-2 rounded border border-white/10 bg-black/20 p-3">
										<div className="flex items-center gap-2">
											<span className="font-medium text-warm-cream">
												{variation.vietnamese}
											</span>
											<SpeakButton text={variation.vietnamese} size="small" />
										</div>
										<div className="text-gold text-sm">{variation.english}</div>
									</div>

									<div className="text-white/50 text-xs italic">
										{variation.notes}
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
							Practice all types of conditionals
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
