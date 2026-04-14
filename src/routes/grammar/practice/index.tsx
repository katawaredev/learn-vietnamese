import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { PracticeModeToggle } from "~/components/PracticeModeToggle";
import { Layout } from "../-layout";
import { ArrangeExercise } from "./-ArrangeExercise";
import { type Exercise, getRandomGrammarExercise } from "./-exercise-generator";
import { GapFillSpeakExercise } from "./-GapFillSpeakExercise";
import { GapFillTypeExercise } from "./-GapFillTypeExercise";

export const Route = createFileRoute("/grammar/practice/")({
	component: PracticeComponent,
	loader: () => getRandomGrammarExercise({ data: {} }),
	ssr: false,
});

function PracticeComponent() {
	const initialExercise = Route.useLoaderData() as Exercise;
	const [exercise, setExercise] = useState(initialExercise);
	const [mode, setMode] = useState<string[]>(["random"]);
	const [exerciseKey, setExerciseKey] = useState(0);
	const hintRef = useRef<(() => void) | null>(null);

	const handleNext = async () => {
		const newExercise = await getRandomGrammarExercise({
			data: { mode: mode[0] ?? "random" },
		});
		setExercise(newExercise);
		setExerciseKey((k) => k + 1);
	};

	const handleHint = () => {
		hintRef.current?.();
	};

	return (
		<Layout
			customNavigation={({ prevRoute }) => (
				<div className="grid grid-cols-[1fr_6rem_1fr] gap-4">
					{prevRoute ? (
						<LinkButton variant="outline" size="medium" to={prevRoute.path}>
							← {prevRoute.label}
						</LinkButton>
					) : (
						<div />
					)}
					<Button variant="outline" size="medium" onClick={handleHint}>
						Hint
					</Button>
					<Button
						variant="outline"
						size="medium"
						onClick={handleNext}
						className="justify-self-end"
					>
						Next
					</Button>
				</div>
			)}
		>
			{/* Controls */}
			<div className="flex w-full flex-col items-center gap-4 pt-8 pb-4">
				<PracticeModeToggle value={mode} onValueChange={setMode} showArrange />
			</div>

			{/* Exercise area */}
			<div className="flex flex-1 items-center">
				<ExerciseRenderer
					key={exerciseKey}
					exercise={exercise}
					hintRef={hintRef}
				/>
			</div>
		</Layout>
	);
}

function ExerciseRenderer({
	exercise,
	hintRef,
}: {
	exercise: Exercise;
	hintRef: React.RefObject<(() => void) | null>;
}) {
	switch (exercise.type) {
		case "arrange":
			return <ArrangeExercise exercise={exercise} onHintRef={hintRef} />;
		case "gap-fill-type":
			return <GapFillTypeExercise exercise={exercise} onHintRef={hintRef} />;
		case "gap-fill-speak":
			return <GapFillSpeakExercise exercise={exercise} onHintRef={hintRef} />;
	}
}
