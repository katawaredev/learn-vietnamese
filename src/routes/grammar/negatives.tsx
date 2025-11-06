import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/negatives")({
	component: NegativesComponent,
});

/**
 * TODO: Implement Negatives page
 *
 * Three main negation patterns in Vietnamese:
 *
 * 1. KHÔNG (not/no)
 *    Usage: General negation before verbs
 *    Pattern: Subject + không + Verb + Object
 *
 *    Example: "Tôi không thích ăn cá."
 *             (I do not like eating fish.)
 *
 *    Key points:
 *    - Most common negation
 *    - Goes directly before the verb
 *    - Works with action verbs and stative verbs
 *
 * 2. KHÔNG PHẢI LÀ (is not/are not/am not)
 *    Usage: Negation with to-be verb (copula)
 *    Pattern: Subject + không phải là + Noun/Adjective
 *
 *    Example: "Bạn không phải là giáo viên."
 *             (You are not a teacher.)
 *
 *    Key points:
 *    - Used for identity/classification
 *    - Cannot use just "không" with "là"
 *    - Similar to English "is not"
 *
 * 3. CHƯA (not yet/has not)
 *    Usage: Negation for incomplete actions
 *    Pattern: Subject + chưa + Verb + Object
 *
 *    Example: "Bố tôi chưa gọi cho tôi."
 *             (My dad has not called me yet.)
 *
 *    Key points:
 *    - Implies action hasn't happened but might happen
 *    - Different from "không" which is definite negation
 *    - Often used with "rồi" in questions: "Ăn cơm chưa?" (Have you eaten yet?)
 *
 * Comparison:
 * - "Tôi không ăn cơm" = I don't/won't eat rice (definite)
 * - "Tôi chưa ăn cơm" = I haven't eaten rice yet (but might)
 *
 * Other negative words (for advanced section):
 * - chẳng: emphatic negation (colloquial)
 * - chả: even more emphatic (informal)
 * - không bao giờ: never
 * - không ai: nobody
 * - không gì: nothing
 * - không đâu: nowhere
 *
 * Data structure suggestion:
 * - Create negatives.json
 * - Include: pattern, usage, examples, comparison sentences
 * - Show affirmative vs negative pairs
 *
 * Component structure:
 * - Disclosure introducing negation system
 * - Three main sections (không, không phải là, chưa)
 * - Each section:
 *   - Pattern explanation
 *   - Visual diagram
 *   - Multiple examples with audio
 *   - Common mistakes to avoid
 * - Comparison table: không vs chưa
 * - Practice grid with sentences to negate
 * - Advanced section with other negative words
 */

function NegativesComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Negative Sentences
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
