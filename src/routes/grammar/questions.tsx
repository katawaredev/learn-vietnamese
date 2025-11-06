import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/questions")({
	component: QuestionsComponent,
});

/**
 * TODO: Implement Questions page
 *
 * Three types of questions in Vietnamese:
 *
 * 1. QUESTIONS WITH A QUESTION WORD
 *    Question words:
 *    - Cái gì (What)
 *    - Khi nào (When)
 *    - Tại sao (Why)
 *    - Bằng cách nào (How - manner)
 *    - Như thế nào (How - manner or feeling)
 *    - Ai (Who, Whom)
 *    - Của Ai (Whose)
 *    - Cái nào (Which)
 *    - Ở đâu (Where)
 *
 *    Two patterns:
 *    Pattern 1: Question word + Subject + Verb + Object + ?
 *    Example: "Tại sao bạn thích món ăn Việt Nam?"
 *             (Why do you like Vietnamese food?)
 *
 *    Pattern 2: Subject + Verb + Object + Question word + ?
 *    Example: "Bạn cảm thấy như thế nào?"
 *             (How do you feel?)
 *
 *    Note: Unlike English, Vietnamese doesn't move question words
 *    (no wh-movement). They stay in logical position.
 *
 * 2. YES-NO QUESTIONS
 *    Add these particles at the end of SVO:
 *    - không (simple yes/no)
 *    - phải không (seeking confirmation)
 *    - đúng không (you...don't you?)
 *    - phải chứ
 *    - đúng chứ
 *    - được không
 *    - được chứ
 *    - chứ
 *    - nhỉ
 *    - hả
 *
 *    Examples:
 *    - "Bạn thích du lịch không?" (Do you like traveling?)
 *    - "Bạn thích du lịch đúng không?" (You like traveling, don't you?)
 *
 *    The second shows a guess and asks for confirmation.
 *
 * 3. RHETORICAL QUESTIONS (Câu hỏi tu từ)
 *    Questions that express opinion/feeling, not requiring answer.
 *    Used in writing to trigger curiosity.
 *
 *    Phrases to start:
 *    - chẳng phải
 *    - có lẽ nào
 *    - phải chăng
 *    - liệu rằng
 *
 *    Pattern: [phrase] + SVO + ?
 *    Example: "Chẳng phải đã đến lúc chúng ta phải hành động?"
 *             (It's time to have action, isn't it?)
 *
 * Data structure suggestion:
 * - Create questions.json
 * - Group by type: question-word, yes-no, rhetorical
 * - Include: Vietnamese, English, type, pattern
 * - Show correct word order
 *
 * Component structure:
 * - Disclosure for introduction (3 types overview)
 * - Section 1: Question words with examples
 *   - Grid or table of question words
 *   - Pattern explanations with visual diagrams
 *   - Interactive examples
 * - Section 2: Yes-no questions
 *   - List of particles with nuance differences
 *   - Side-by-side comparisons
 * - Section 3: Rhetorical questions
 *   - Examples from literature
 *   - Practice forming rhetorical questions
 */

function QuestionsComponent() {
	return (
		<Layout>
			<div className="space-y-6">
				<h1 className="font-bold font-serif text-3xl text-gold">Questions</h1>
				<p className="text-lg text-white/70">
					Content coming soon. Check the source code for implementation notes.
				</p>
			</div>
		</Layout>
	);
}
