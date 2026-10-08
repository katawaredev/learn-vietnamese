import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ListenButton } from "~/components/ListenButton";
import { ResultVoiceIndicator } from "~/components/ResultIndicator";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";
import type { GapFillExercise } from "./-exercise-generator";

interface GapFillSpeakExerciseProps {
	exercise: GapFillExercise;
	onHintRef: React.RefObject<(() => void) | null>;
}

export function GapFillSpeakExercise({ exercise, onHintRef }: GapFillSpeakExerciseProps) {
	const [transcriptions, setTranscriptions] = useState<(string | null | undefined)[]>(() =>
		exercise.gaps.map(() => undefined),
	);
	const [hintTexts, setHintTexts] = useState<string[]>(() => exercise.gaps.map(() => ""));
	const [hintLevel, setHintLevel] = useState<number[]>(() => exercise.gaps.map(() => 0));

	// Find the next gap that hasn't been completed
	const activeGap = transcriptions.indexOf(undefined);

	// Hint: first narrows grammar type, then reveals letters
	const handleHint = useCallback(() => {
		const gapIdx = activeGap >= 0 ? activeGap : 0;
		const gap = exercise.gaps[gapIdx];
		if (!gap) return;

		const currentLevel = hintLevel[gapIdx];

		if (currentLevel === 0) {
			// First hint: show grammar type as narrowing hint
			setHintTexts((prev) => prev.map((h, i) => (i === gapIdx ? gap.grammarType : h)));
			setHintLevel((prev) => prev.map((l, i) => (i === gapIdx ? 1 : l)));
		} else {
			// Subsequent hints: reveal letters progressively
			setHintTexts((prev) =>
				prev.map((h, i) => {
					if (i !== gapIdx) return h;
					const expected = gap.expected;
					const currentHint = h.length === expected.length ? h : " ".repeat(expected.length);
					const unrevealed = expected
						.split("")
						.map((_, idx) => (currentHint[idx] === " " ? idx : -1))
						.filter((idx) => idx !== -1);

					if (unrevealed.length === 0) return h;
					const revealIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
					return expected
						.split("")
						.map((c, j) => (j === revealIdx || currentHint[j] !== " " ? c : " "))
						.join("");
				}),
			);
			setHintLevel((prev) => prev.map((l, i) => (i === gapIdx ? l + 1 : l)));
		}
	}, [activeGap, exercise.gaps, hintLevel]);

	useEffect(() => {
		onHintRef.current = handleHint;
		return () => {
			onHintRef.current = null;
		};
	}, [handleHint, onHintRef]);

	const handleTranscription = (gapIndex: number, text: string | null) => {
		setTranscriptions((prev) => prev.map((t, i) => (i === gapIndex ? (text ?? null) : t)));
	};

	return (
		<div className="flex animate-in flex-col items-center space-y-8 duration-500 fade-in slide-in-from-right-96">
			{/* English prompt */}
			<h2 className="text-center text-5xl font-bold">{exercise.english}</h2>

			{/* Sentence with mic gaps */}
			<div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-4 text-xl">
				{exercise.segments.map((segment, i) => {
					if (segment.kind === "text") {
						return (
							// oxlint-disable-next-line react/no-array-index-key -- segments are positional
							<div key={i} className="flex flex-wrap gap-x-3">
								{segment.words.map((w, wi) => {
									const wordColor = GRAMMAR_TYPE_COLORS[w.grammarType] ?? "text-white/90";
									return (
										<span
											// oxlint-disable-next-line react/no-array-index-key -- words are positional
											key={wi}
											className="inline-flex flex-col items-center"
										>
											<span className={wordColor}>{w.text}</span>
											<span className="text-[0.65rem] leading-tight text-white/50">
												{w.meaning}
											</span>
										</span>
									);
								})}
							</div>
						);
					}

					const gap = exercise.gaps[segment.gapIndex];
					const transcription = transcriptions[segment.gapIndex];
					const hintText = hintTexts[segment.gapIndex];

					const typeColor = GRAMMAR_TYPE_COLORS[gap.grammarType] ?? "text-white/70";

					return (
						<span
							// oxlint-disable-next-line react/no-array-index-key -- segments are positional
							key={i}
							className="relative inline-flex flex-col items-center"
						>
							<ListenButton
								className="mx-1 inline-flex"
								onTranscription={(text) => handleTranscription(segment.gapIndex, text)}
								size="small"
							/>
							{transcription !== undefined && (
								<span className="absolute -right-1 -bottom-1 scale-75">
									<ResultVoiceIndicator
										key={String(transcription)}
										transcription={transcription}
										expectedText={gap.expected}
										isNew
										hideExpected
									/>
								</span>
							)}
							<span className={twMerge("mt-1 text-[0.65rem] tracking-widest uppercase", typeColor)}>
								{gap.grammarType}
							</span>
							<span className="mt-0.5 h-4 font-mono text-xs tracking-widest text-white/40">
								{hintText}
							</span>
						</span>
					);
				})}
			</div>
		</div>
	);
}
