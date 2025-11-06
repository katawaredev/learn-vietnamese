import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/demonstratives")({
	component: DemonstrativesComponent,
});

/**
 * TODO: Implement Demonstratives page
 *
 * Vietnamese demonstratives mark distance and position (deixis)
 *
 * Three-term deictic system + indefinite:
 *
 * 1. PROXIMAL (close - "this, here")
 *    Nominal: đây "here"
 *    Nominal/Modifier: (none at this level)
 *    Modifier: này/nầy/nay/ni "this"
 *    Proportion: bây "to this extent"
 *    Manner: vầy "this way, thus"
 *
 * 2. MEDIAL (far - "that, there")
 *    Nominal: đấy "there"
 *    Nominal/Modifier: đó "there, that"
 *    Modifier: nấy/ấy "that"
 *    Proportion: bấy "to that extent"
 *    Manner: vậy "that way, so"
 *
 * 3. DISTAL (very far - "yonder, over there")
 *    Nominal: (none)
 *    Nominal/Modifier: kia/kìa "over there, yonder"
 *    Modifier: nọ "yonder" (past only)
 *    Proportion: bao "to what extent"
 *    Manner: sao "how"
 *
 * 4. INDEFINITE/INTERROGATIVE ("which, where")
 *    Nominal: đâu "where, wherever"
 *    Modifier: nào "which(ever)"
 *
 * Regional variations:
 * - Northern: này
 * - Southern: nầy
 * - North-Central/Central: ni, nớ (instead of nọ), mô (instead of nào/đâu),
 *   rứa (instead of vậy), răng (instead of sao)
 * - Hanoi: thế/như thế "so, this way" (instead of vầy)
 *
 * Key patterns:
 *
 * 1. Demonstrative position: AFTER noun (unlike English)
 *    - Example: "bà này" (lady this) = "this lady"
 *    - Example: "con chó đen này" (dog black this) = "this black dog"
 *
 * 2. Function types:
 *    - Nominal: can be noun ("đây là anh nó" = "this is his brother")
 *    - Modifier: modify nouns only ("người đó" = "that person")
 *    - Nominal/Modifier: can do both ("đó là anh nó" or "người đó")
 *
 * 3. Distance indicated by tone:
 *    - ngang tone (no mark): closest
 *    - huyền tone (falling `): further
 *    - sắc/nặng tone (rising/broken): even further
 *    - Example: đây (here-close) → đấy (there-further) → ...
 *    - Example: kia → kìa → kía → kịa → kĩa (increasingly far future)
 *
 * 4. Temporal demonstratives (directional differences):
 *    - kia: bidirectional (past OR future)
 *      "ngày kia" = "some day to come" OR "the other day"
 *    - nọ: unidirectional (past only)
 *      "ngày nọ" = "the other day" (only past)
 *
 * 5. Proportion demonstratives (with measure words):
 *    - "bây giờ" (this time) = "now"
 *    - "bấy giờ" (that time) = "then"
 *    - "bao giờ" (what time) = "when"
 *    - "bây nhiêu" (this much/many)
 *    - "bấy nhiêu" (that much/many)
 *    - "bao nhiêu" (how much/many)
 *    - "bấy lâu" (that long)
 *    - "bao lâu" (how long)
 *
 * 6. Metaphorical use (referring to people):
 *    - "đây đi chợ, đấy có đi không?"
 *      Literal: "this goes market, that go or not?"
 *      Meaning: "I'm going to the market, what about you?"
 *
 * Data structure suggestion:
 * - Create demonstratives.json
 * - Group by: proximal, medial, distal, indefinite
 * - Include: form, function, examples, regional variants
 * - Show nominal vs modifier usage
 *
 * Component structure:
 * - Disclosure introducing deictic system
 * - Visual distance diagram (proximal → medial → distal)
 * - Table showing all forms by function
 * - Regional variant notes
 * - Interactive examples showing position in sentences
 * - Special section on temporal demonstratives
 * - Proportion demonstratives with common phrases
 */

function DemonstrativesComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Demonstratives (này, đó, kia)
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
