import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import dataFile from "~/data/grammar/tenses.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/tenses")({
	component: TensesComponent,
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

interface MarkerItem {
	vietnamese: string;
	meaning: string;
	position: string;
	usage: string;
	examples: Example[];
}

interface Section {
	id: string;
	title: string;
	description: string;
	items: MarkerItem[];
}

interface CombinationExample {
	markers: string;
	meaning: string;
	example: string;
	notes: string;
}

interface TensesData {
	introduction: {
		title: string;
		content: string[];
	};
	sections: Section[];
	combinations: {
		title: string;
		description: string;
		examples: CombinationExample[];
	};
	practiceSentences: Array<{
		vietnamese: string;
		english: string;
		marker: string;
		difficulty: string;
	}>;
}

function AnnotatedSentence({ example }: { example: Example }) {
	const stripSubscript = (text: string) => text.replace(/[₀-₉]+$/, "");

	return (
		<div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6">
			{/* Vietnamese words with colors */}
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

function TensesComponent() {
	const data = dataFile as unknown as TensesData;

	// Convert practice sentences to grid format
	const practiceData = data.practiceSentences.reduce(
		(acc, sentence) => {
			acc[sentence.vietnamese] = {
				meaning: sentence.english,
				marker: sentence.marker,
				difficulty: sentence.difficulty,
			};
			return acc;
		},
		{} as Record<
			string,
			{ meaning: string; marker: string; difficulty: string }
		>,
	);

	return (
		<Layout>
			<div className="space-y-8">
				{/* Page Header */}
				<div>
					<h1 className="font-bold font-serif text-3xl text-gold">
						Tense Markers
					</h1>
					<p className="mt-2 text-lg text-white/70">
						Vietnamese doesn't conjugate verbs - it uses tense markers instead
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
							<p key={paragraph} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Tense Marker Sections */}
				{data.sections.map((section) => (
					<div key={section.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{section.title}
							</h2>
							<p className="mt-1 text-white/60">{section.description}</p>
						</div>

						{section.items.map((item) => (
							<div
								key={item.vietnamese}
								className="space-y-4 rounded-lg border border-gold/30 bg-gold/5 p-6"
							>
								{/* Marker header */}
								<div className="flex flex-wrap items-center gap-4">
									<div className="flex items-center gap-3">
										<span className="font-bold text-2xl text-orange-500">
											{item.vietnamese}
										</span>
										<SpeakButton text={item.vietnamese} size="small" />
									</div>
									<div className="flex flex-col gap-1">
										<span className="font-semibold text-white/90">
											{item.meaning}
										</span>
										<span className="text-sm text-white/50">
											Position:{" "}
											<span className="italic">{item.position} verb</span>
										</span>
									</div>
								</div>

								{/* Usage description */}
								<p className="text-white/70">{item.usage}</p>

								{/* Examples */}
								<div className="space-y-4">
									{item.examples.map((example) => (
										<AnnotatedSentence
											key={example.vietnamese}
											example={example}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				))}

				{/* Combinations Section */}
				<div className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							{data.combinations.title}
						</h2>
						<p className="mt-1 text-white/60">
							{data.combinations.description}
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{data.combinations.examples.map((combo) => (
							<div
								key={combo.markers}
								className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-5"
							>
								<div>
									<div className="font-bold text-orange-500">
										{combo.markers}
									</div>
									<div className="text-sm text-white/70">{combo.meaning}</div>
								</div>
								<div className="flex items-center gap-2 border-white/10 border-t pt-3">
									<span className="font-semibold text-warm-cream">
										{combo.example}
									</span>
									<SpeakButton text={combo.example} size="small" />
								</div>
								<div className="text-white/50 text-xs italic">
									{combo.notes}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Practice Grid */}
				<div className="space-y-4">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Sentences
						</h2>
						<p className="mt-1 text-white/60">
							Click any card to see details and hear pronunciation
						</p>
					</div>

					<PracticeGrid<{ meaning: string; marker: string; difficulty: string }>
						data={practiceData}
						getSubtitle={(item) => item.meaning}
						getDetails={(vietnamese, item) => ({
							Vietnamese: <span className="text-warm-cream">{vietnamese}</span>,
							English: (
								<span className="font-bold text-gold">{item.meaning}</span>
							),
							Marker: <span className="text-orange-500">{item.marker}</span>,
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
									{item.difficulty}
								</span>
							),
						})}
					/>
				</div>
			</div>
		</Layout>
	);
}
