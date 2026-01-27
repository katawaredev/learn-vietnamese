import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { SpeakButton } from "~/components/SpeakButton";
import dataFile from "~/data/grammar/tenses.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/tenses")({
	component: TensesComponent,
});

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
									<GrammarPracticeGrid examples={item.examples} />
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
