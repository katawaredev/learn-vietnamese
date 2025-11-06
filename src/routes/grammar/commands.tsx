import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/commands")({
	component: CommandsComponent,
});

/**
 * TODO: Implement Commands page
 *
 * Command/Imperative sentences in Vietnamese
 *
 * BASIC STRUCTURE:
 * Pattern: Verb + đi + !
 *
 * The word "đi" is often added after verbs in commands to
 * soften the command or add encouragement.
 *
 * Examples:
 * - "Ăn đi!" (Eat!)
 * - "Nhanh lên!" (Hurry up!)
 * - "Nhìn kìa!" (Look!)
 *
 * Key points:
 * - Start with verb (no subject needed)
 * - End with exclamation mark
 * - "đi" makes it less harsh
 * - "lên" also used for encouragement
 *
 * WITH PRONOUNS:
 * Adding pronoun clarifies who you're commanding
 *
 * Pattern: [Pronoun] + Verb + đi + !
 *
 * Example: "Con ăn đi!"
 *          (Child, eat!) - when asking your child to eat
 *
 * Common contexts:
 * - Con: speaking to child
 * - Em: speaking to younger sibling/person
 * - Anh/Chị: (rare in commands, can sound rude)
 *
 * POLITE COMMANDS (Services/Formal):
 *
 * 1. VUI LÒNG (please)
 *    Pattern: [Subject] + vui lòng + Verb + !
 *
 *    Example: "Quý khách vui lòng điền thông tin vào đây!"
 *             (Guests, please fill your information here!)
 *
 * 2. XIN MỜI (invite to do)
 *    Pattern: Xin mời + [Subject] + Verb
 *
 *    Example: "Xin mời anh ngồi."
 *             (Please have a seat.)
 *
 * 3. LÀM ƠN (please - less formal than vui lòng)
 *    Pattern: Làm ơn + Verb
 *
 *    Example: "Làm ơn giúp tôi."
 *             (Please help me.)
 *
 * NEGATIVE COMMANDS (Prohibitions):
 *
 * Pattern: Đừng + Verb + !
 * OR: Không + Verb + !
 *
 * Examples:
 * - "Đừng đi!" (Don't go!)
 * - "Không được làm vậy!" (You must not do that!)
 * - "Đừng quên!" (Don't forget!)
 *
 * "Đừng" is softer than "không"
 *
 * COMMAND PARTICLES:
 *
 * 1. đi: soften, encourage
 *    "Học đi!" (Study! - encouraging)
 *
 * 2. lên: urge, hurry
 *    "Nhanh lên!" (Hurry up!)
 *
 * 3. đi...đi: repeated for emphasis/encouragement
 *    "Ăn đi ăn đi!" (Eat, eat! - insisting gently)
 *
 * 4. mau: quickly
 *    "Mau lên!" (Hurry! Quick!)
 *
 * TONE VARIATIONS:
 * - Verb alone: harsh, abrupt
 * - Verb + đi: softer, encouraging
 * - Làm ơn/Vui lòng + Verb: polite
 * - Xin mời + Verb: very polite, inviting
 *
 * Context matters:
 * - With family: more direct commands acceptable
 * - With strangers: use polite forms
 * - In service: always use vui lòng/xin mời
 *
 * Data structure suggestion:
 * - Create commands.json
 * - Categories: basic, polite, negative
 * - Include: command, politeness level, context, examples
 *
 * Component structure:
 * - Disclosure introducing imperative mood
 * - Warning about politeness levels
 * - Section 1: Basic commands (Verb + đi)
 *   - Common commands
 *   - Audio examples
 * - Section 2: With pronouns
 *   - When and why to add pronouns
 * - Section 3: Polite forms
 *   - Grid showing vui lòng, xin mời, làm ơn
 *   - Usage contexts
 * - Section 4: Negative commands (đừng, không)
 * - Section 5: Command particles
 *   - Table of particles and their effects
 * - Practice exercises: convert sentences to commands
 */

function CommandsComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">
					Commands & Imperatives
				</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
