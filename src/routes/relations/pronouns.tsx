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
	ipa: string;
	notes: string;
	contexts: string[];
	gender: string;
	formality: string;
}

function PronounsComponent() {
	return (
		<Layout>
			<Disclosure
				className="w-full"
				title={
					<span className="font-bold text-gold text-lg">Addressing people</span>
				}
			>
				<div className="space-y-4">
					<p>
						Vietnamese pronouns are not just words—they encode{" "}
						<strong className="text-gold">
							hierarchy, respect, and relationship
						</strong>
						. You cannot say "you" or "I" neutrally; each pronoun signals
						relative age, status, and social distance.
					</p>

					<div>
						<strong className="text-gold">Core Principles:</strong>
						<ul className="mt-2 ml-6 list-disc space-y-1">
							<li>
								<strong>Age matters:</strong> Older people receive terms of
								respect; younger people get terms that position you above.
							</li>
							<li>
								<strong>Family logic:</strong> Even strangers are addressed
								using kinship terms (uncle, aunt, sibling).
							</li>
							<li>
								<strong>Hierarchy overrides age:</strong> Family position
								matters more than actual age—someone younger can be "chị/anh" if
								they're structurally above you (e.g., a younger than you spouse
								of an elder family member).
							</li>
							<li>
								<strong>Mirror terms:</strong> If someone calls you "em," you
								call them "anh/chị."
							</li>
							<li>
								<strong>When in doubt, go lower:</strong> It's safer to call
								yourself "em" and the other person "anh/chị" than the reverse.
							</li>
							<li>
								<strong>Breaking pronoun norms:</strong> Shows warmth or
								humility—using a lower form for yourself to honor someone. But
								raising yourself or misjudging rank sounds rude.
							</li>
						</ul>
					</div>

					<div>
						<strong className="text-gold">Common Pairings:</strong>
						<ul className="mt-2 ml-6 list-disc space-y-1">
							<li>
								<code>em</code> (I, younger) ↔ <code>anh/chị</code> (you, older)
							</li>
							<li>
								<code>con</code> (I, child) ↔ <code>bố/mẹ</code> (you, parent)
							</li>
							<li>
								<code>cháu</code> (I, grandchild) ↔{" "}
								<code>ông/bà/bác/chú/cô</code> (you, elder)
							</li>
							<li>
								<code>tôi</code> (I, formal) ↔ <code>bạn</code> (you, neutral)
							</li>
							<li>
								<code>mình</code> (I/you, intimate) ↔ close friends/partners
							</li>
							<li>
								<code>tao</code> (I, rough) ↔ <code>mày</code> (you, rough)
							</li>
						</ul>
					</div>

					<div>
						<strong className="text-gold">Quick Guide:</strong>
						<ul className="mt-2 ml-6 list-disc space-y-1">
							<li>
								<strong>Slightly older male:</strong> Call him "anh," call
								yourself "em"
							</li>
							<li>
								<strong>Slightly older female:</strong> Call her "chị," call
								yourself "em"
							</li>
							<li>
								<strong>Younger person:</strong> Call them "em," call yourself
								"anh/chị"
							</li>
							<li>
								<strong>Parent's age:</strong> Use "cô" (woman), "chú" (man), or
								"bác" (elder)
							</li>
							<li>
								<strong>Elderly:</strong> Use "ông" (man) or "bà" (woman)
							</li>
							<li>
								<strong>Peers/uncertain:</strong> Use "bạn" (safer for learners)
							</li>
							<li>
								<strong>Formal/business:</strong> Use "tôi" (I) and "bạn" (you)
							</li>
						</ul>
					</div>
				</div>
			</Disclosure>

			<PracticeGrid<PronounsData>
				data={pronounsData}
				getSubtitle={(item) => item.role}
				getDetails={(name, item) => ({
					Name: name,
					IPA: <code>/{item.ipa}/</code>,
					Role: item.role,
					Notes: item.notes,
					Gender: item.gender,
					Formality: item.formality,
					Contexts: item.contexts.join(", "),
				})}
			/>
		</Layout>
	);
}
