import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/Button";
import { ResultTextIndicator } from "~/components/ResultIndicator";
import { SpeakButton } from "~/components/SpeakButton";
import { WordInput } from "~/components/WordInput";
import { DictationLayout, useDictationPractice, validateSlug } from "./-layout";

export const Route = createFileRoute("/dictation/listen/$slug")({
	beforeLoad: ({ params }) => {
		const { slug } = params;

		// Verify slug exists in data
		if (!validateSlug(slug)) {
			throw redirect({ to: "/dictation" });
		}
	},
	component: ListenPracticeComponent,
});

function TextInputWithResult({
	expectedText,
	hint,
	onCorrect,
}: {
	expectedText: string;
	hint: string;
	onCorrect: () => void;
}) {
	const [userInput, setUserInput] = useState("");

	// Strip all punctuation for comparison in listen mode
	const normalizedExpected = expectedText.replace(/[.,!?;:'"]/g, "").trim();
	const showResult = userInput.length === normalizedExpected.length;

	const handleChange = (value: string) => {
		setUserInput(value);
		if (value === normalizedExpected) {
			// Delay to show the result before enabling next
			setTimeout(() => onCorrect(), 500);
		}
	};

	return (
		<>
			<WordInput
				className="ml-[6ch] justify-center"
				text={normalizedExpected}
				hint={hint}
				onChange={handleChange}
			/>
			<div className="mt-8 h-8">
				{showResult && (
					<ResultTextIndicator
						key={userInput}
						inputText={userInput}
						expectedText={normalizedExpected}
					/>
				)}
			</div>
		</>
	);
}

function ListenPracticeComponent() {
	const { slug } = Route.useParams();
	const [hint, setHint] = useState("");

	const practice = useDictationPractice({ slug });

	if (!practice) {
		return <div>Story not found</div>;
	}

	const { entry, currentIndex, currentSentence, setCurrentIndex } = practice;

	// Strip punctuation from sentence for hint calculation
	const normalizedText = currentSentence.vn.replace(/[.,!?;:'"]/g, "").trim();

	const handleCorrect = () => {
		// No-op: we don't block anymore
	};

	const handleIndexChange = (newIndex: number) => {
		setCurrentIndex(newIndex);
		setHint(""); // Reset hint for next sentence
	};

	const handleHint = () => {
		// Initialize hint: preserve spaces from original, blank spaces for unrevealed letters
		const currentHint =
			hint ||
			normalizedText
				.split("")
				.map((char) => (char === " " ? " " : " "))
				.join("");

		// Find positions where we can reveal a letter
		const unrevealed = normalizedText
			.split("")
			.map((char: string, i: number) => {
				// Skip if already revealed (currentHint has non-space at this position)
				if (currentHint[i] !== " ") return -1;
				// Skip spaces in the original text (we preserve them, not reveal)
				if (char === " ") return -1;
				// Valid letter position to reveal
				return i;
			})
			.filter((i: number) => i !== -1);

		// All letters already revealed
		if (unrevealed.length === 0) return;

		// Pick random unrevealed letter position
		const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];

		// Build new hint character-by-character
		const newHint = normalizedText
			.split("")
			.map((char: string, i: number) => {
				// Always preserve spaces from original text
				if (char === " ") return " ";
				// Reveal the selected position
				if (i === idx) return char;
				// Keep previously revealed letters
				if (currentHint[i] !== " ") return currentHint[i];
				// Keep unrevealed as blank space
				return " ";
			})
			.join("");

		setHint(newHint);
	};

	const hintButton =
		hint.replace(/\s/g, "").length <
		normalizedText.replace(/\s/g, "").length ? (
			<Button variant="outline" size="medium" onClick={handleHint}>
				Hint
			</Button>
		) : undefined;

	return (
		<DictationLayout
			entry={entry}
			currentIndex={currentIndex}
			onIndexChange={handleIndexChange}
			practiceContent={<SpeakButton text={currentSentence.vn} size="large" />}
			translationContent={<code>{currentSentence.en}</code>}
			inputContent={
				<TextInputWithResult
					expectedText={currentSentence.vn}
					hint={hint}
					onCorrect={handleCorrect}
				/>
			}
			navigationMiddle={hintButton}
		/>
	);
}
