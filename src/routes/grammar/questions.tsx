import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import questionsData from "~/data/grammar/questions.json";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { type WordData, WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/questions")({
	component: QuestionsComponent,
});

interface Pattern {
	id: string;
	title: string;
	description: string;
	structure: string;
	examples: Example[];
}

interface ParticleGroup {
	id: string;
	title: string;
	description: string;
	particles: Record<string, WordData>;
}

interface QuestionType {
	id: string;
	title: string;
	description: string;
	questionWords?: Record<string, WordData>;
	patterns?: Pattern[];
	particleGroups?: ParticleGroup[];
	rhetoricalPhrases?: Record<string, WordData>;
	examples?: Example[];
}

interface QuestionsData {
	introduction: {
		title: string;
		content: string[];
	};
	questionTypes: QuestionType[];
}

function QuestionsComponent() {
	const data = questionsData as unknown as QuestionsData;

	const whQuestions = data.questionTypes.find((t) => t.id === "wh-questions");
	const yesNoQuestions = data.questionTypes.find(
		(t) => t.id === "yes-no-questions",
	);
	const rhetoricalQuestions = data.questionTypes.find(
		(t) => t.id === "rhetorical-questions",
	);

	return (
		<Layout>
			<div className="space-y-8">
				{/* Introduction */}
				<Disclosure
					defaultOpen
					title={
						<span className="font-bold text-lg">{data.introduction.title}</span>
					}
				>
					<div className="space-y-4">
						{data.introduction.content.map((paragraph) => (
							<p
								key={paragraph.slice(0, 50)}
								className="text-white/80 leading-relaxed"
							>
								{paragraph}
							</p>
						))}
					</div>
				</Disclosure>

				{/* Wh-Questions */}
				{whQuestions && (
					<div className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{whQuestions.title}
							</h2>
							<p className="mt-1 text-white/60">{whQuestions.description}</p>
						</div>

						{whQuestions.questionWords && (
							<WordGrid
								data={whQuestions.questionWords}
								titleClassName={GRAMMAR_TYPE_COLORS.question}
							/>
						)}

						{/* Patterns with Examples */}
						{whQuestions.patterns?.map((pattern) => (
							<div key={pattern.id} className="space-y-4">
								<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
									<div className="mb-2 font-semibold text-gold">
										{pattern.title}
									</div>
									<div className="text-sm text-white/70">
										{pattern.description}
									</div>
									<div className="mt-2 font-mono text-sm text-white/60">
										Pattern: {pattern.structure}
									</div>
								</div>
								<Disclosure plain title="Examples" defaultOpen>
									<GrammarPracticeGrid examples={pattern.examples} />
								</Disclosure>
							</div>
						))}
					</div>
				)}

				{/* Yes-No Questions */}
				{yesNoQuestions && (
					<div className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{yesNoQuestions.title}
							</h2>
							<p className="mt-1 text-white/60">{yesNoQuestions.description}</p>
						</div>

						{/* Particle Groups */}
						{yesNoQuestions.particleGroups?.map((group) => (
							<div key={group.id} className="space-y-4">
								<div>
									<h3>{group.title}</h3>
									<p className="text-sm text-white/50">{group.description}</p>
								</div>

								<WordGrid
									data={group.particles}
									titleClassName={GRAMMAR_TYPE_COLORS.particle}
								/>
							</div>
						))}

						{/* Yes-No Examples */}
						{yesNoQuestions.examples && yesNoQuestions.examples.length > 0 && (
							<Disclosure plain title="Examples" defaultOpen>
								<GrammarPracticeGrid examples={yesNoQuestions.examples} />
							</Disclosure>
						)}
					</div>
				)}

				{/* Rhetorical Questions */}
				{rhetoricalQuestions && (
					<div className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{rhetoricalQuestions.title}
							</h2>
							<p className="mt-1 text-white/60">
								{rhetoricalQuestions.description}
							</p>
						</div>

						{rhetoricalQuestions.rhetoricalPhrases && (
							<WordGrid
								data={rhetoricalQuestions.rhetoricalPhrases}
								titleClassName={GRAMMAR_TYPE_COLORS.rhetorical}
							/>
						)}

						{rhetoricalQuestions.examples &&
							rhetoricalQuestions.examples.length > 0 && (
								<Disclosure plain title="Examples" defaultOpen>
									<GrammarPracticeGrid
										examples={rhetoricalQuestions.examples}
									/>
								</Disclosure>
							)}
					</div>
				)}
			</div>
		</Layout>
	);
}
