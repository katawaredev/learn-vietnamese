import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/sentence-structure")({
	component: SentenceStructureComponent,
});

/**
 * TODO: Implement Sentence Structure page
 *
 * Topics to cover:
 * 1. Basic word order: Subject-Verb-Object (SVO)
 *    - Examples: "Tôi ăn cơm" (I eat rice)
 *    - Compare to English SVO pattern
 *
 * 2. Topic-comment structure (topic-prominent language)
 *    - Example: "Sách này (thì) tôi đọc rồi" (This book, I read already)
 *    - Topic marker "thì"
 *    - How topics can be fronted for emphasis
 *
 * 3. Head-initial phrases
 *    - Head of phrase precedes complements
 *    - Noun phrase structure
 *    - Modifiers come after nouns
 *
 * 4. Noun phrase structure (see research for full pattern):
 *    TOTALITY + ARTICLE + QUANTIFIER + CLASSIFIER + HEAD NOUN +
 *    ATTRIBUTIVE MODIFIER(S) + DEMONSTRATIVE + PREPOSITIONAL PHRASE
 *
 *    Example: "cả hai cuốn từ điển Việt Anh này của nó"
 *    (both of these Vietnamese-English dictionaries of his)
 *
 * 5. Verb serialization
 *    - Multiple verbs in sequence without conjunctions
 *    - Examples and usage patterns
 *
 * Data structure suggestion:
 * - Create sentence-patterns.json with examples
 * - Include Vietnamese, English, breakdown
 * - Show correct vs incorrect patterns
 *
 * Component structure:
 * - Disclosure for introduction
 * - Sections for each topic
 * - Interactive examples with annotations
 */

function SentenceStructureComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Sentence Structure
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
