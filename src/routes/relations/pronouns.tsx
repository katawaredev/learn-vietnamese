import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import pronounsData from "~/data/relations/pronouns.json";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/relations/pronouns")({
	component: PronounsComponent,
});

interface PronounsData {
	role: string;
	reciprocal: string;
	usage: string;
	notes: string;
	contexts: string[];
	gender: string;
	formality: string;
	priority: number;
	ipa: string;
}

function PronounsComponent() {
	// Group pronouns by priority
	const groupedData = Object.entries(pronounsData).reduce(
		(acc, [key, value]) => {
			const priority = value.priority;
			if (!acc[priority]) acc[priority] = {};
			acc[priority][key] = value;
			return acc;
		},
		{} as Record<number, Record<string, PronounsData>>,
	);

	const priorityLabels: Record<number, { title: string; desc: string }> = {
		1: {
			title: "Essential",
			desc: "Used daily in most conversations",
		},
		2: {
			title: "Important",
			desc: "Family terms and respectful forms for elders",
		},
		3: {
			title: "Useful",
			desc: "Extended family and specific contexts",
		},
		4: {
			title: "Advanced",
			desc: "Casual/rough forms—use with caution",
		},
	};

	return (
		<Layout>
			<Disclosure
				className="w-full"
				title={
					<span className="font-bold text-gold text-lg">Core Principles</span>
				}
			>
				<div className="space-y-4">
					<p>
						Vietnamese pronouns encode{" "}
						<strong className="text-gold">
							hierarchy, respect, and relationship
						</strong>
						. You cannot say "you" or "I" neutrally—each pronoun signals
						relative age, status, and social distance.
					</p>

					<ul className="mt-2 ml-6 list-disc space-y-2">
						<li>
							<strong>Reciprocal pairs:</strong> Pronouns work in pairs. If
							someone calls you "em," you call them "anh/chị."
						</li>
						<li>
							<strong>Age hierarchy:</strong> Older people receive terms of
							respect; younger people get terms positioning you above.
						</li>
						<li>
							<strong>Hierarchy overrides age:</strong> Family position matters
							more than actual age. Your older sibling's younger spouse is still
							"anh/chị" to you.
						</li>
						<li>
							<strong>Family logic:</strong> Even strangers are addressed using
							kinship terms (uncle, aunt, sibling).
						</li>
						<li>
							<strong>When unsure, go lower:</strong> Safer to call yourself
							"em" than risk positioning yourself too high.
						</li>
						<li>
							<strong>Misjudging rank = rude:</strong> Using too high a term for
							yourself or too low for others sounds disrespectful.
						</li>
						<li>
							<strong>Add "ạ" for politeness:</strong> The particle "ạ" after
							pronouns or at sentence end shows respect (e.g., "Dạ, em hiểu ạ" =
							"Yes, I understand"). Essential for formal situations.
						</li>
					</ul>
					<p>
						<strong>Read more:</strong>{" "}
						<a
							href="https://en.wikipedia.org/wiki/Vietnamese_pronouns"
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							Wikipedia: Vietnamese pronouns
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
								<h2 className="font-bold text-2xl text-gold">
									{priorityLabels[Number(priority)].title}
								</h2>
								<p className="text-sm text-white/60">
									{priorityLabels[Number(priority)].desc}
								</p>
							</div>
							<PracticeGrid<PronounsData>
								data={data}
								getSubtitle={(item) => item.role}
								getDetails={(name, item) => ({
									Pronoun: name,
									"Pair with": (
										<span className="font-bold text-gold">
											{item.reciprocal}
										</span>
									),
									"When to use": item.usage,
									Formality: item.formality,
									Gender: item.gender,
									"Key notes": item.notes,
									Contexts: item.contexts.join(", "),
									IPA: <code>/{item.ipa}/</code>,
								})}
							/>
						</div>
					))}
			</div>
		</Layout>
	);
}
