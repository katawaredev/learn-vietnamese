import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/focus-markers")({
	component: FocusMarkersComponent,
});

/**
 * TODO: Implement Focus Markers page
 *
 * Focus marker "cái" - a special particle that indicates contrastive focus
 *
 * Key concepts:
 *
 * 1. Position: Before classifier (not after)
 *    - Pattern: cái + classifier + noun
 *    - Example: "cái con chó này" (this very dog)
 *    - WRONG: *"con cái chó này" (ungrammatical)
 *
 * 2. Always requires a classifier
 *    - Cannot stand alone
 *    - Must have: cái + [classifier] + noun
 *
 * 3. Different from classifier "cái"
 *    - Classifier cái: for inanimate objects only
 *      Example: "cái bàn" (table) - OK
 *      Example: "cái chó" (dog) - WRONG (chó is animate)
 *    - Focus marker cái: works with ANY animacy
 *      Example: "cái con chó" (this very dog) - OK with animate
 *      Example: "cái cuốn sách" (this very book) - OK with inanimate
 *      Example: "cái người lính" (this very soldier) - OK with human
 *
 * 4. Indicates contrastive focus
 *    - Emphasizes one element in contrast to others
 *    - Example: "tôi thích CÁI con ngựa ĐEN"
 *      (I like the BLACK horse [not other colors])
 *    - Example: "tôi thích CÁI con NGỰA đen"
 *      (I like the black HORSE [not other animals])
 *
 * 5. Requires stress/intonation
 *    - Focus marker "CÁI" receives stress
 *    - Focused element also receives stress (capitals above)
 *    - Cannot occur without stressed element
 *
 * 6. Can focus various elements
 *    - Adjectives: "cái con ngựa ĐEN"
 *    - Nouns: "cái con NGỰA đen"
 *    - Prepositional phrases
 *    - Relative clauses
 *
 * 7. Connotation
 *    - Often pejorative/negative: "cái thằng chồng em nó..."
 *      (that husband of mine [dismissive])
 *    - But not always: "cái con nhỏ tử tế"
 *      (the kind-hearted girl [positive emphasis])
 *
 * 8. Precedes other pre-noun modifiers
 *    - Pattern: numeral/article + cái + classifier
 *    - Example: "hai cái con chó đen này"
 *      (these very two black dogs)
 *    - Example: "mấy cái con mèo này"
 *      (these very cats)
 *
 * Data structure suggestion:
 * - Create focus-examples.json
 * - Include: sentence, stressed element, meaning, connotation
 * - Show correct vs incorrect patterns
 * - Audio examples with proper stress
 *
 * Component structure:
 * - Disclosure explaining cái (classifier) vs cái (focus)
 * - Visual examples showing stress patterns
 * - Audio examples demonstrating intonation
 * - Contrastive examples (with/without focus marker)
 * - Common phrases with focus marker
 */

function FocusMarkersComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Focus Markers (cái)
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
