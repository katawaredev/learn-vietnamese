import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import classifiersData from "~/data/grammar/classifiers.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/classifiers")({
	component: ClassifiersComponent,
});

interface ClassifierData {
	meaning: string;
	usage: string;
	examples: string;
	notes?: string;
	priority: number;
}

function ClassifiersComponent() {
	// Group classifiers by priority
	const groupedData = (
		classifiersData as Array<{
			classifier: string;
			meaning: string;
			usage: string;
			examples: string;
			notes?: string;
			priority: number;
		}>
	).reduce(
		(acc, item) => {
			const priority = item.priority;
			if (!acc[priority]) acc[priority] = {};
			acc[priority][item.classifier] = {
				meaning: item.meaning,
				usage: item.usage,
				examples: item.examples,
				notes: item.notes,
				priority: item.priority,
			};
			return acc;
		},
		{} as Record<number, Record<string, ClassifierData>>,
	);

	const priorityLabels: Record<number, { title: string; desc: string }> = {
		1: {
			title: "Essential",
			desc: "Master these first—used in daily conversation",
		},
		2: {
			title: "Common",
			desc: "Frequently used in everyday situations",
		},
		3: {
			title: "Useful",
			desc: "Less frequent but still important to know",
		},
	};

	return (
		<Layout>
			<Disclosure
				defaultOpen
				title={
					<span className="font-bold text-gold text-lg">
						What Are Classifiers?
					</span>
				}
			>
				<div className="space-y-4">
					<p>
						Vietnamese uses <strong className="text-gold">classifiers</strong>{" "}
						(từ loại)—words that categorize nouns based on their properties.
						They appear between numbers/quantifiers and nouns.
					</p>

					<div className="rounded-lg border border-white/10 bg-white/5 p-4">
						<p className="mb-2 font-semibold text-gold">Basic Pattern:</p>
						<p className="font-mono">[Number] + [Classifier] + [Noun]</p>
						<p className="mt-2 text-sm text-white/70">
							Example: <span className="text-warm-cream">hai</span>{" "}
							<span className="text-gold">con</span>{" "}
							<span className="text-warm-cream">mèo</span> = two{" "}
							<span className="italic">[animal classifier]</span> cats
						</p>
					</div>

					<ul className="mt-2 ml-6 list-disc space-y-2">
						<li>
							<strong>When classifiers are REQUIRED:</strong> With numbers,
							quantifiers (mỗi, mấy), or demonstratives (này, đó). You must say
							"hai con mèo" (two cats), "con mèo này" (this cat).
						</li>
						<li>
							<strong>When classifiers are OPTIONAL:</strong> In general
							statements without counting or pointing. "Tôi thích chó" (I like
							dogs [in general]) vs "Tôi thích con chó này" (I like this dog).
						</li>
						<li>
							<strong>Each classifier has meaning:</strong> "Con" suggests
							animacy or motion, "cái" suggests inanimate objects, "người"
							specifies people.
						</li>
						<li>
							<strong>Some nouns work with multiple classifiers:</strong> The
							choice changes the nuance. "Con dao" (a knife in use/active) vs
							"cái dao" (a knife as an object).
						</li>
						<li>
							<strong>Classifiers reflect properties:</strong> Shape (flat,
							round, long), function (vehicles, books), or arrangement (pairs,
							sets).
						</li>

						<li>
							<strong>About 200 classifiers exist:</strong> But only 20-30 are
							used regularly in daily conversation.
						</li>
					</ul>

					<p>
						<strong>Read more:</strong>{" "}
						<a
							href="https://en.wikipedia.org/wiki/Vietnamese_grammar#Classifier_position"
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							Wikipedia: Vietnamese Classifiers
						</a>
					</p>
				</div>
			</Disclosure>

			<div className="space-y-8">
				{Object.entries(groupedData)
					.sort(([a], [b]) => Number(a) - Number(b))
					.map(([priority, data]) => (
						<div key={priority}>
							<div className="mb-4">
								<h2 className="font-bold font-serif text-2xl text-gold">
									{priorityLabels[Number(priority)].title}
								</h2>
								<p className="text-sm text-white/60">
									{priorityLabels[Number(priority)].desc}
								</p>
							</div>
							<PracticeGrid<ClassifierData>
								data={data}
								getSubtitle={(item) => item.meaning}
								getDetails={(name, item) => {
									const details: Record<string, React.ReactNode> = {
										Classifier: name,
										Meaning: (
											<span className="font-bold text-gold">
												{item.meaning}
											</span>
										),
										"Used for": item.usage,
										Examples: item.examples,
									};
									if (item.notes) {
										details.Notes = (
											<span className="text-gold/80 italic">{item.notes}</span>
										);
									}
									return details;
								}}
							/>
						</div>
					))}
			</div>
		</Layout>
	);
}
