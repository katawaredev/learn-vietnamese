import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/exclamations")({
	component: ExclamationsComponent,
});

/**
 * TODO: Implement Exclamations page
 *
 * Exclamatory sentences (Câu cảm thán) express emotions,
 * feelings, compliments, or judgments.
 *
 * BASIC PATTERNS:
 *
 * Vietnamese has multiple ways to express exclamations
 * using particles added to adjectives/statements.
 *
 * Common particles:
 * - quá: so/too/very
 * - thế: so/such
 * - thật là: really/truly
 * - luôn: really/actually (emphasizing)
 *
 * PATTERN 1: Subject + Adjective + quá + !
 *
 * Example: "Hoàng hôn đẹp quá!"
 *          (The sunset is so beautiful!)
 *
 * "Quá" emphasizes excess or strong degree
 * Most common exclamation particle
 *
 * PATTERN 2: Subject + Adjective + thế + !
 *
 * Example: "Hoàng hôn đẹp thế!"
 *          (The sunset is so beautiful!)
 *
 * "Thế" means "like that/such"
 * Slightly less emphatic than "quá"
 *
 * PATTERN 3: Subject + thật là + Adjective + !
 *
 * Example: "Hoàng hôn thật là đẹp!"
 *          (The sunset is really beautiful!)
 *
 * "Thật là" = really/truly
 * More formal, literary
 *
 * PATTERN 4: Subject + quá + Adjective + luôn + !
 *
 * Example: "Hoàng hôn quá đẹp luôn!"
 *          (The sunset is really so beautiful!)
 *
 * "Luôn" adds extra emphasis
 * Very colloquial, enthusiastic
 *
 * EMOTIONS EXPRESSED:
 *
 * 1. ADMIRATION/POSITIVE:
 *    - "Đẹp quá!" (So beautiful!)
 *    - "Hay quá!" (So interesting/good!)
 *    - "Tuyệt vời quá!" (So wonderful!)
 *
 * 2. SURPRISE:
 *    - "Sao thế!" (How come!/What!)
 *    - "Trời ơi!" (Oh my God!)
 *    - "Không thể tin được!" (Unbelievable!)
 *
 * 3. SADNESS/DISAPPOINTMENT:
 *    - "Buồn quá!" (So sad!)
 *    - "Tiếc quá!" (What a pity!)
 *    - "Thật đáng tiếc!" (Really regrettable!)
 *
 * 4. ANGER/FRUSTRATION:
 *    - "Khó chịu quá!" (So annoying!)
 *    - "Tệ quá!" (So bad!)
 *
 * 5. HAPPINESS/JOY:
 *    - "Vui quá!" (So happy!)
 *    - "Tuyệt quá!" (So great!)
 *
 * ADDITIONAL PATTERNS:
 *
 * 1. Sao + Adjective + thế!
 *    "Sao đẹp thế!" (How beautiful it is!)
 *
 * 2. Adjective + làm sao!
 *    "Đẹp làm sao!" (How beautiful!)
 *
 * 3. Quả là + Adjective!
 *    "Quả là tuyệt vời!" (Indeed wonderful!)
 *
 * 4. Thật + Adjective!
 *    "Thật tuyệt!" (Really great!)
 *
 * COMBINING PARTICLES:
 *
 * Multiple particles can be combined for stronger emphasis:
 *
 * - "Thật là đẹp quá!"
 *   (Really so beautiful!)
 *
 * - "Quá đẹp luôn!"
 *   (So beautiful indeed!)
 *
 * - "Đẹp quá đi thôi!"
 *   (So beautiful! - very enthusiastic)
 *
 * INTERJECTIONS:
 *
 * Common Vietnamese interjections:
 * - Ôi/Ối: Oh!
 * - Trời ơi: Oh my God!
 * - Chà/Chao: Wow!
 * - Ơ: Huh? (surprise)
 * - Ái chà/Ái da: Ouch!/Oh dear!
 * - Ủa: Huh?/What? (confusion)
 *
 * REGIONAL VARIATIONS:
 *
 * Northern: More reserved, use "thật" more
 * Southern: More expressive, use "quá...luôn" more
 * Central: Mix of both
 *
 * Data structure suggestion:
 * - Create exclamations.json
 * - Include: pattern, particle, emotion, examples
 * - Group by emotion type
 * - Audio for proper intonation
 *
 * Component structure:
 * - Disclosure introducing exclamatory mood
 * - Important note about intonation (crucial!)
 * - Section 1: Four basic patterns
 *   - Visual comparison showing all four
 *   - Audio examples with proper intonation
 * - Section 2: Emotions categories
 *   - Grid organized by emotion
 *   - Common exclamations for each
 * - Section 3: Particle guide
 *   - Table of particles (quá, thế, thật là, luôn)
 *   - Intensity levels
 * - Section 4: Interjections
 *   - Common sounds/words
 *   - When to use
 * - Practice: Match emotions to exclamations
 */

function ExclamationsComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Exclamations & Emphasis
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
