import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/tenses")({
	component: TensesComponent,
});

/**
 * TODO: Implement Tenses page
 *
 * Vietnamese doesn't conjugate verbs, but uses tense markers (particles):
 *
 * 1. Past tense: "đã" (before verb)
 *    - Example: "Tôi đã ăn tối" (I had dinner)
 *
 * 2. Future tense: "sẽ" (before verb)
 *    - Example: "Tôi sẽ ăn tối" (I will have dinner)
 *
 * 3. Just completed: "vừa mới" (before verb)
 *    - Can drop "vừa": "Tôi mới ăn tối" (more common)
 *    - Example: "Tôi vừa mới ăn tối" (I just had dinner)
 *
 * 4. About to: "sắp" (before verb)
 *    - Example: "Tôi sắp ăn tối" (I am about to have dinner)
 *
 * 5. Already: "rồi" (AFTER verb, unique!)
 *    - Often combined with "đã"
 *    - Example: "Tôi (đã) ăn tối rồi" (I already had dinner)
 *
 * 6. Continuous: "đang" (before verb)
 *    - Can combine with other markers (uncommon)
 *    - Example: "Tôi đang ăn tối" (I am having dinner)
 *    - Example: "Tôi đã đang ăn tối" (I was having dinner)
 *
 * 7. Affirmative past: "có" (before verb, similar to "đã")
 *    - Also used for emphasis
 *
 * Important notes:
 * - Context often makes tense clear, markers are optional
 * - "rồi" is the only marker that goes AFTER the verb
 * - Multiple markers can combine but it's uncommon
 *
 * Data structure suggestion:
 * - Create tense-markers.json
 * - Include: marker, position (before/after), meaning, examples
 * - Show combinations that are valid
 *
 * Component structure:
 * - Disclosure for introduction (Vietnamese vs English tenses)
 * - Timeline visualization showing markers
 * - Interactive examples with audio
 * - Practice grid with tense marker cards
 */

function TensesComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Tense Markers
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
