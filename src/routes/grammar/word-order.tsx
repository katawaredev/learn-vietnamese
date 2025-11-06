import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/word-order")({
	component: WordOrderComponent,
});

/**
 * TODO: Implement Word Order page
 *
 * Key concepts:
 *
 * 1. Basic pattern: Subject-Verb-Object (SVO)
 *    - Same as English
 *    - Example: "Mai ăn cơm" (Mai eats rice)
 *    - Subject: Mai | Verb: ăn | Object: cơm
 *
 * 2. Topic-prominent structure
 *    - Vietnamese allows topic fronting
 *    - Topic marker "thì" (optional)
 *    - Example: "Sách này (thì) tôi đọc rồi"
 *      (This book [topic marker] I read already)
 *    - Structure: TOPIC + (thì) + SUBJECT + VERB + ...
 *
 * 3. Adjectives after nouns
 *    - Unlike English: noun comes first, then modifier
 *    - English: "black dog" → Vietnamese: "chó đen" (dog black)
 *    - Example: "con ngựa đen" (horse black) vs English "black horse"
 *
 * 4. Question words don't move (no wh-movement)
 *    - Question word stays in its logical position
 *    - Example: "Bạn đọc sách gì?" (You read book what?)
 *    - English moves "what" to front, Vietnamese doesn't
 *
 * 5. Verb interleaving for emphasis
 *    - Verb can split compound words
 *    - Example: "biết" (know) + "thân phận" (place) →
 *      "biết thân biết phận" (know one's place)
 *    - Example: "đi" (go) + "tới lui" (back and forth) →
 *      "đi tới đi lui" (go back and forth)
 *
 * 6. Demonstratives and modifiers position in noun phrases
 *    - Demonstratives come AFTER noun
 *    - Pattern: noun + adjective + demonstrative
 *    - Example: "con chó đen này" (dog black this) = "this black dog"
 *
 * Data structure suggestion:
 * - Create word-order-examples.json
 * - Include: Vietnamese, English, word-by-word breakdown
 * - Show both correct Vietnamese order and literal translation
 * - Compare with English equivalent
 *
 * Component structure:
 * - Disclosure introducing differences from English
 * - Visual diagrams showing word order patterns
 * - Side-by-side comparisons (Vietnamese vs English)
 * - Interactive exercises rearranging words
 * - Special section on topic-comment structure
 */

function WordOrderComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Word Order & Topic-Comment Structure
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
