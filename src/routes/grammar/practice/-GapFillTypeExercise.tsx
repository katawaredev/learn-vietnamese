import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ResultTextIndicator } from "~/components/ResultIndicator";
import { WordInput } from "~/components/WordInput";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";
import type { GapFillExercise } from "./-exercise-generator";

interface GapFillTypeExerciseProps {
	exercise: GapFillExercise;
	onHintRef: React.RefObject<(() => void) | null>;
}

export function GapFillTypeExercise({
	exercise,
	onHintRef,
}: GapFillTypeExerciseProps) {
	const [inputs, setInputs] = useState<string[]>(() =>
		exercise.gaps.map(() => ""),
	);
	const [hints, setHints] = useState<string[]>(() =>
		exercise.gaps.map((g) => " ".repeat(g.expected.length)),
	);
	const [activeGap, setActiveGap] = useState(0);

	// Hint: reveal a random letter in the active gap
	const handleHint = useCallback(() => {
		const gap = exercise.gaps[activeGap];
		if (!gap) return;

		const currentHint = hints[activeGap];
		const unrevealed = gap.expected
			.split("")
			.map((_, i) => (currentHint[i] === " " ? i : -1))
			.filter((i) => i !== -1);

		if (unrevealed.length === 0) return;

		const revealIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
		setHints((prev) =>
			prev.map((h, i) => {
				if (i !== activeGap) return h;
				return gap.expected
					.split("")
					.map((c, j) => (j === revealIdx || h[j] !== " " ? c : " "))
					.join("");
			}),
		);
	}, [activeGap, exercise.gaps, hints]);

	useEffect(() => {
		onHintRef.current = handleHint;
		return () => {
			onHintRef.current = null;
		};
	}, [handleHint, onHintRef]);

	const handleInputChange = (gapIndex: number, value: string) => {
		setInputs((prev) => prev.map((v, i) => (i === gapIndex ? value : v)));

		// Auto-advance when filled
		const gap = exercise.gaps[gapIndex];
		if (
			value.length === gap.expected.length &&
			gapIndex < exercise.gaps.length - 1
		) {
			setActiveGap(gapIndex + 1);
		}
	};

	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-8 duration-500">
			{/* English prompt */}
			<h2 className="text-center font-bold text-5xl">{exercise.english}</h2>

			{/* Sentence with gaps */}
			<div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-4 text-xl">
				{exercise.segments.map((segment, i) => {
					if (segment.kind === "text") {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: segments are positional
							<div key={i} className="flex flex-wrap gap-x-3">
								{segment.words.map((w, wi) => {
									const wordColor =
										GRAMMAR_TYPE_COLORS[w.grammarType] ?? "text-white/90";
									return (
										<span
											// biome-ignore lint/suspicious/noArrayIndexKey: words are positional
											key={wi}
											className="inline-flex flex-col items-center"
										>
											<span className={wordColor}>{w.text}</span>
											<span className="text-[0.65rem] text-white/50 leading-tight">
												{w.meaning}
											</span>
										</span>
									);
								})}
							</div>
						);
					}

					const gap = exercise.gaps[segment.gapIndex];
					const input = inputs[segment.gapIndex];
					const hint = hints[segment.gapIndex];
					const isFilled = input.length === gap.expected.length;

					const typeColor =
						GRAMMAR_TYPE_COLORS[gap.grammarType] ?? "text-white/70";

					return (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: segments are positional
							key={i}
							className="relative inline-flex flex-col items-center"
						>
							<WordInput
								text={gap.expected}
								hint={hint}
								onChange={(v) => handleInputChange(segment.gapIndex, v)}
								autoFocus={segment.gapIndex === 0}
							/>
							<span
								className={twMerge(
									"mt-1 text-[0.65rem] uppercase tracking-widest",
									typeColor,
								)}
							>
								{gap.grammarType}
							</span>
							{isFilled && (
								<span className="absolute -right-2 -bottom-6">
									<ResultTextIndicator
										size="small"
										key={input}
										inputText={input}
										expectedText={gap.expected}
									/>
								</span>
							)}
						</span>
					);
				})}
			</div>
		</div>
	);
}
