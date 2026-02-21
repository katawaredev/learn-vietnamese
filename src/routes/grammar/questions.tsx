import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import questionsData from "~/data/grammar/questions.json";
import {
	type Example,
	GrammarPracticeGrid,
} from "~/layout/GrammarPracticeGrid";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/questions")({
	component: QuestionsComponent,
});

interface WordData {
	meaning: string;
	notes: string[];
}

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

function WordGrid({
	data,
	titleClassName,
}: {
	data: Record<string, WordData>;
	titleClassName?: string;
}) {
	return (
		<PracticeGrid<WordData>
			data={data}
			titleClassName={titleClassName}
			getSubtitle={(item) => item.meaning}
			getDetails={(_word, item) => ({
				Notes: (
					<ul className="mt-1 ml-4 list-disc space-y-1 text-sm text-white/70">
						{item.notes.map((note) => (
							<li key={note.slice(0, 30)}>{note}</li>
						))}
					</ul>
				),
			})}
			size="medium"
		/>
	);
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
						<span className="font-bold text-gold text-lg">
							{data.introduction.title}
						</span>
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
								titleClassName="text-pink-500"
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
								<h3>Examples:</h3>
								<GrammarPracticeGrid examples={pattern.examples} />
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
									titleClassName="text-orange-400"
								/>
							</div>
						))}

						{/* Yes-No Examples */}
						{yesNoQuestions.examples && yesNoQuestions.examples.length > 0 && (
							<>
								<h3>Examples:</h3>
								<GrammarPracticeGrid examples={yesNoQuestions.examples} />
							</>
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
								titleClassName="text-rose-500"
							/>
						)}

						{rhetoricalQuestions.examples &&
							rhetoricalQuestions.examples.length > 0 && (
								<>
									<h3>Examples:</h3>
									<GrammarPracticeGrid
										examples={rhetoricalQuestions.examples}
									/>
								</>
							)}
					</div>
				)}
			</div>
		</Layout>
	);
}
