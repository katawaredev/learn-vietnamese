import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { Separator } from "~/components/Separator";
import { SpeakButton } from "~/components/SpeakButton";
import dataFile from "~/data/grammar/tenses.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/tenses")({
	component: TensesComponent,
});

interface MarkerData {
	meaning: string;
	position: string;
	usage: string;
	example: string;
}

interface Section {
	id: string;
	title: string;
	description: string;
	markers: Record<string, MarkerData>;
}

interface CombinationExample {
	markers: string;
	meaning: string;
	example: string;
	translation: string;
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
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Tense Marker Sections */}
				{data.sections.map((section) => {
					const markersData = Object.entries(section.markers).reduce(
						(acc, [marker, markerData]) => {
							acc[marker] = markerData;
							return acc;
						},
						{} as Record<string, MarkerData>,
					);

					return (
						<div key={section.id} className="space-y-6">
							<div>
								<h2 className="font-bold font-serif text-2xl text-gold">
									{section.title}
								</h2>
								<p className="mt-1 text-white/60">{section.description}</p>
							</div>

							<PracticeGrid<MarkerData>
								data={markersData}
								getSubtitle={(item) => item.meaning}
								getDetails={(_marker, item) => ({
									Position: (
										<span className="text-warm-cream">{item.position}</span>
									),
									Usage: <span className="text-white/80">{item.usage}</span>,
									Example: (
										<div className="text-sm text-white/70">{item.example}</div>
									),
								})}
								size="medium"
							/>
						</div>
					);
				})}

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
								{/* Top part */}
								<div>
									<div className="font-bold text-orange-500">
										{combo.markers}
									</div>
									<div className="text-sm text-white/70">{combo.meaning}</div>
								</div>

								<Separator />

								{/* Middle part - sentence, translation, and speak button */}
								<div className="flex flex-col items-center space-y-1.5">
									<div className="font-semibold text-warm-cream">
										{combo.example}
									</div>
									<div className="text-warm-cream/60 text-xs">
										{combo.translation}
									</div>
									<div>
										<SpeakButton text={combo.example} size="small" />
									</div>
								</div>

								<Separator />

								{/* Bottom part - notes */}
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
