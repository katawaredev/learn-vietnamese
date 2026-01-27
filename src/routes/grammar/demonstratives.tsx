import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import demonstrativesData from "~/data/grammar/demonstratives.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/demonstratives")({
	component: DemonstrativesComponent,
});

interface DistanceLevel {
	distance: string;
	label: string;
	forms: string[];
	primary: string;
}

interface Section {
	id: string;
	title: string;
	description: string;
	distanceLevels?: DistanceLevel[];
	examples: Example[];
	types?: Array<{
		form: string;
		distance: string;
		meaning: string;
	}>;
}

function DistanceDiagram({ levels }: { levels: DistanceLevel[] }) {
	const colorMap: Record<string, string> = {
		proximal: "bg-blue-500/20 border-blue-500/50 text-blue-300",
		medial: "bg-purple-500/20 border-purple-500/50 text-purple-300",
		distal: "bg-red-500/20 border-red-500/50 text-red-300",
		indefinite: "bg-gray-500/20 border-gray-500/50 text-gray-300",
	};

	return (
		<div className="my-8 space-y-6">
			<h3 className="font-semibold text-lg text-white">
				Distance System (Deixis)
			</h3>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{levels.map((level) => (
					<div
						key={level.distance}
						className={`rounded-lg border p-4 ${colorMap[level.distance] || "border-white/10 bg-white/5 text-white"}`}
					>
						<div className="mb-2 font-bold text-sm uppercase tracking-wider">
							{level.label}
						</div>
						<div className="mb-3 font-bold text-2xl">{level.primary}</div>
						<div className="space-y-1 text-xs">
							{level.forms.map((form) => (
								<div key={form} className="opacity-70">
									{form}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function DemonstrativesComponent() {
	const data = demonstrativesData as unknown as {
		introduction: {
			title: string;
			content: string[];
		};
		sections: Section[];
		practiceSentences: Array<{
			vietnamese: string;
			english: string;
			type: string;
			difficulty: string;
		}>;
	};

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

	return (
		<Layout>
			<div className="space-y-8">
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
							<p key={paragraph.slice(0, 50)}>{paragraph}</p>
						))}

						<div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-4">
							<p className="font-semibold text-gold">
								⚠️ Key Difference from English:
							</p>
							<p className="mt-2">
								Vietnamese demonstratives come <strong>AFTER</strong> the noun,
								not before!
							</p>
							<div className="mt-3 space-y-1 font-mono text-sm">
								<div>
									<span className="text-white/50">English:</span>{" "}
									<span className="text-warm-cream">this book</span>
								</div>
								<div>
									<span className="text-white/50">Vietnamese:</span>{" "}
									<span className="text-warm-cream">quyển sách này</span>{" "}
									<span className="text-white/40">(book this)</span>
								</div>
							</div>
						</div>
					</div>
				</Disclosure>

				{/* Sections */}
				{data.sections.map((section) => (
					<div key={section.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{section.title}
							</h2>
							<p className="mt-2 text-white/70">{section.description}</p>
						</div>

						{/* Distance Diagram (for modifiers section) */}
						{section.distanceLevels && (
							<DistanceDiagram levels={section.distanceLevels} />
						)}

						{/* Proportion types table (for proportion section) */}
						{section.types && (
							<div className="overflow-hidden rounded-lg border border-white/10">
								<table className="w-full">
									<thead className="bg-white/5">
										<tr>
											<th className="px-4 py-3 text-left font-semibold text-sm text-white">
												Form
											</th>
											<th className="px-4 py-3 text-left font-semibold text-sm text-white">
												Distance
											</th>
											<th className="px-4 py-3 text-left font-semibold text-sm text-white">
												Meaning
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/10">
										{section.types.map((type) => (
											<tr key={type.form} className="hover:bg-white/5">
												<td className="px-4 py-3 font-bold font-mono text-fuchsia-400">
													{type.form}
												</td>
												<td className="px-4 py-3 text-sm text-white/70">
													{type.distance}
												</td>
												<td className="px-4 py-3 text-sm text-white/70">
													{type.meaning}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{/* Examples */}
						<div className="space-y-4">
							<GrammarPracticeGrid examples={section.examples} />
						</div>
					</div>
				))}

				{/* Practice Section */}
				<div className="space-y-6 border-white/10 border-t pt-8">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Practice Demonstratives
						</h2>
						<p className="mt-2 text-sm text-white/60">
							Practice using demonstratives in different contexts
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
							Type:
								item.type.charAt(0).toUpperCase() +
								item.type.slice(1).replace(/-/g, " "),
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
