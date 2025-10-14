import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { ResultTextIndicator } from "~/components/ResultIndicator";
import { SpeakButton } from "~/components/SpeakButton";
import { WordInput } from "~/components/WordInput";
import { A1 } from "~/data/dictation";
import Header from "~/layout/Header";

interface DictationEntry {
	slug: string;
	title: {
		en: string;
		vn: string;
	};
	story: Array<{
		en: string;
		vn: string;
	}>;
}

export const Route = createFileRoute("/dictation/listen/$slug")({
	beforeLoad: ({ params }) => {
		const { slug } = params;

		// Verify slug exists in data
		const allEntries = { ...A1 };
		if (!allEntries[slug]) {
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
	const navigate = useNavigate();

	const entry = A1[slug] as DictationEntry;
	const [currentIndex, setCurrentIndex] = useState(0);
	const [hint, setHint] = useState("");

	if (!entry) {
		return <div>Story not found</div>;
	}

	const currentSentence = entry.story[currentIndex];
	const isLastSentence = currentIndex === entry.story.length - 1;
	const progress = `${currentIndex + 1} / ${entry.story.length}`;

	// Strip punctuation from sentence for hint calculation
	const normalizedText = currentSentence.vn.replace(/[.,!?;:'"]/g, "").trim();

	const handleCorrect = () => {
		// No-op: we don't block anymore
	};

	const handleNext = () => {
		if (isLastSentence) {
			navigate({ to: "/dictation" });
		} else {
			setCurrentIndex((prev) => prev + 1);
			setHint(""); // Reset hint for next sentence
		}
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

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header>
				<div className="text-center">
					<h1 className="font-bold font-serif text-warm-cream text-xl">
						{entry.title.vn}
					</h1>
					<p className="text-gold/80 text-xs">{progress}</p>
				</div>
			</Header>
			<main className="flex flex-1 flex-col px-4 pb-8">
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
					{/* Practice Area */}
					<div className="flex flex-1 items-center justify-center">
						<div
							key={currentIndex}
							className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500"
						>
							<div className="flex min-h-[200px] items-center justify-center">
								<SpeakButton text={currentSentence.vn} size="large" />
							</div>
							<div className="flex flex-col items-center space-y-4">
								<TextInputWithResult
									expectedText={currentSentence.vn}
									hint={hint}
									onCorrect={handleCorrect}
								/>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<div className="mx-auto w-full max-w-4xl pt-12">
						<div className="grid grid-cols-[1fr_6rem_1fr] gap-4">
							<LinkButton variant="outline" size="medium" to="/dictation">
								← Stories
							</LinkButton>
							{hint.replace(/\s/g, "").length <
							normalizedText.replace(/\s/g, "").length ? (
								<Button variant="outline" size="medium" onClick={handleHint}>
									Hint
								</Button>
							) : (
								<div />
							)}
							<Button variant="outline" size="medium" onClick={handleNext}>
								{isLastSentence ? "Complete" : "Next →"}
							</Button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
