import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/conditionals")({
	component: ConditionalsComponent,
});

/**
 * TODO: Implement Conditionals page
 *
 * Conditional sentences in Vietnamese use: Nếu...thì structure
 *
 * BASIC STRUCTURE:
 * Pattern: Nếu + [if-clause], thì + [result clause]
 *
 * Example: "Nếu trời mưa thì tôi sẽ không đi làm."
 *          (If it rains, I will not go to work.)
 *
 * Key components:
 * - Nếu = if
 * - thì = then
 * - Both are required in formal speech/writing
 *
 * VARIATIONS:
 *
 * 1. Comma instead of "thì"
 *    "Nếu trời mưa, tôi sẽ không đi làm."
 *    More casual, but "thì" is preferred in formal contexts
 *
 * 2. Without "nếu" (implied condition)
 *    More colloquial, relies on context
 *
 * CONDITIONAL TYPES:
 *
 * 1. REAL/POSSIBLE CONDITIONALS (Present/Future)
 *    Describes something that can/might happen
 *
 *    Pattern: Nếu + present tense, thì + future/present
 *
 *    Example: "Nếu bạn học chăm chỉ thì bạn sẽ thành công."
 *             (If you study hard, you will succeed.)
 *
 * 2. UNREAL/COUNTERFACTUAL CONDITIONALS (Past)
 *    Describes something that didn't happen
 *    Result clause must be in past tense (with đã)
 *
 *    Pattern: Nếu + past tense, thì + đã + verb
 *
 *    Example: "Nếu tôi không nói thế thì anh đã không đến đây."
 *             (If I didn't say that, you wouldn't have come here.)
 *
 *    Key point: The "đã" in result clause indicates this is
 *    a past counterfactual (something that didn't happen)
 *
 * 3. HABITUAL/GENERAL CONDITIONALS
 *    Describes something that generally/always happens
 *
 *    Pattern: Nếu + present, thì + present
 *
 *    Example: "Nếu trời nóng thì tôi uống nhiều nước."
 *             (If it's hot, I drink a lot of water.)
 *
 * ADDITIONAL CONDITIONAL WORDS:
 * - Nếu như: same as "nếu" but more emphatic
 * - Giả sử: suppose/supposing
 * - Trong trường hợp: in case
 * - Trừ khi: unless
 * - Miễn là: as long as
 *
 * Examples:
 * - "Giả sử bạn thắng xổ số, bạn sẽ làm gì?"
 *   (Suppose you win the lottery, what will you do?)
 *
 * - "Tôi sẽ đi, trừ khi trời mưa."
 *   (I will go, unless it rains.)
 *
 * Data structure suggestion:
 * - Create conditionals.json
 * - Include: type, pattern, examples
 * - Show all three conditional types
 * - Include variations and alternatives
 *
 * Component structure:
 * - Disclosure introducing Nếu...thì structure
 * - Visual diagram of sentence structure
 * - Section 1: Real/Possible conditionals
 *   - Pattern explanation
 *   - Examples with audio
 *   - Common uses
 * - Section 2: Unreal/Past conditionals
 *   - Emphasis on "đã" in result clause
 *   - Examples showing what didn't happen
 * - Section 3: Habitual conditionals
 * - Section 4: Alternative conditional words
 *   - Grid of alternatives (giả sử, trừ khi, etc.)
 * - Practice exercises transforming sentences
 */

function ConditionalsComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Conditional Sentences
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
