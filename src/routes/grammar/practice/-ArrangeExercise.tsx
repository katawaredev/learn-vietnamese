import { useCallback, useEffect, useRef, useState } from "react";
import { ChunkButton } from "./-ChunkButton";
import type {
	ArrangeExercise as ArrangeExerciseData,
	Chunk,
} from "./-exercise-generator";

interface ArrangeExerciseProps {
	exercise: ArrangeExerciseData;
	onHintRef: React.RefObject<(() => void) | null>;
}

export function ArrangeExercise({ exercise, onHintRef }: ArrangeExerciseProps) {
	const [pool, setPool] = useState<Chunk[]>(() => [...exercise.chunks]);
	const [placed, setPlaced] = useState<Chunk[]>([]);
	const [result, setResult] = useState<"correct" | "wrong" | null>(null);
	const [revealedDistractors, setRevealedDistractors] = useState<Set<string>>(
		() => new Set(),
	);
	const [revealedPositions, setRevealedPositions] = useState<
		Map<number, string>
	>(() => new Map());
	const checkedRef = useRef(false);

	const correctSlotCount = exercise.correctOrder.length;

	// Register hint handler
	const handleHint = useCallback(() => {
		// Priority 1: Reveal a distractor
		const unrevealedDistractors = exercise.distractorIds.filter(
			(id) => !revealedDistractors.has(id),
		);
		if (unrevealedDistractors.length > 0) {
			const id =
				unrevealedDistractors[
					Math.floor(Math.random() * unrevealedDistractors.length)
				];
			setRevealedDistractors((prev) => new Set([...prev, id]));
			// Remove from placed if it was placed
			setPlaced((prev) => {
				const chunk = prev.find((c) => c.id === id);
				if (chunk) {
					setPool((p) => [...p, chunk]);
					return prev.filter((c) => c.id !== id);
				}
				return prev;
			});
			return;
		}

		// Priority 2: Reveal a correct position
		for (let i = 0; i < exercise.correctOrder.length; i++) {
			if (!revealedPositions.has(i)) {
				setRevealedPositions(
					(prev) => new Map([...prev, [i, exercise.correctOrder[i]]]),
				);
				return;
			}
		}
	}, [exercise, revealedDistractors, revealedPositions]);

	useEffect(() => {
		onHintRef.current = handleHint;
		return () => {
			onHintRef.current = null;
		};
	}, [handleHint, onHintRef]);

	// Auto-check when all slots filled
	useEffect(() => {
		if (placed.length === correctSlotCount && !checkedRef.current) {
			checkedRef.current = true;
			const placedTexts = placed.map((c) => c.text);
			const isCorrect =
				placedTexts.every((text, i) => text === exercise.correctOrder[i]) &&
				placed.every((c) => !c.isDistractor);
			setResult(isCorrect ? "correct" : "wrong");
		}
	}, [placed, correctSlotCount, exercise.correctOrder]);

	const handleTapToPlace = (chunk: Chunk) => {
		if (result) return; // locked after check
		if (placed.length >= correctSlotCount) return;
		setPool((prev) => prev.filter((c) => c.id !== chunk.id));
		setPlaced((prev) => [...prev, chunk]);
	};

	const handleTapToReturn = (chunk: Chunk) => {
		if (result === "correct") return;
		setPlaced((prev) => prev.filter((c) => c.id !== chunk.id));
		setPool((prev) => [...prev, chunk]);
		checkedRef.current = false;
		setResult(null);
	};

	const getChunkState = (chunk: Chunk) => {
		if (revealedDistractors.has(chunk.id))
			return "distractor-revealed" as const;
		return "available" as const;
	};

	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-8 duration-500">
			{/* English prompt */}
			<h2 className="text-center font-bold text-5xl">{exercise.english}</h2>

			{/* Distractor warning */}
			{exercise.hasDistractors && (
				<p className="text-sm text-white/40">
					&#9888; Not all words belong in this sentence
				</p>
			)}

			{/* Answer zone */}
			<div
				className={`flex min-h-[70px] flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-3 transition-all ${
					result === "correct"
						? "animate-stamp border-green-400/50"
						: result === "wrong"
							? "animate-shake border-red-400/50"
							: "border-gold/30"
				}`}
			>
				{placed.map((chunk) => (
					<ChunkButton
						key={chunk.id}
						text={chunk.text}
						grammarType={chunk.grammarType}
						meaning={chunk.meaning}
						state="placed"
						onClick={() => handleTapToReturn(chunk)}
					/>
				))}
				{/* Empty slot placeholders */}
				{Array.from({ length: correctSlotCount - placed.length }).map(
					(_, i) => {
						const posIndex = placed.length + i;
						const hintText = revealedPositions.get(posIndex);
						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: positional placeholders
								key={`empty-${i}`}
								className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-white/15 border-dashed"
							>
								{hintText && (
									<span className="fade-in animate-in text-white/40 text-xs duration-200">
										{hintText}
									</span>
								)}
							</div>
						);
					},
				)}
			</div>

			{/* Result indicator */}
			{result && (
				<div className="text-center text-sm">
					{result === "correct" ? (
						<span className="text-green-400">Correct!</span>
					) : (
						<span className="text-red-400">
							Try again — tap placed words to return them
						</span>
					)}
				</div>
			)}

			{/* Chunk pool */}
			<div className="flex flex-wrap justify-center gap-2.5 sm:grid-cols-none md:flex">
				<div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:justify-center">
					{pool.map((chunk) => (
						<ChunkButton
							key={chunk.id}
							text={chunk.text}
							grammarType={chunk.grammarType}
							meaning={chunk.meaning}
							state={getChunkState(chunk)}
							onClick={() =>
								revealedDistractors.has(chunk.id)
									? undefined
									: handleTapToPlace(chunk)
							}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
