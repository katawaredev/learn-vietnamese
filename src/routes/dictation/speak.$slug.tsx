import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { ResultVoiceIndicator } from "~/components/ResultIndicator";
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

export const Route = createFileRoute("/dictation/speak/$slug")({
	beforeLoad: ({ params }) => {
		const { slug } = params;

		// Verify slug exists in data
		const allEntries = { ...A1 };
		if (!allEntries[slug]) {
			throw redirect({ to: "/dictation" });
		}
	},
	component: SpeakPracticeComponent,
});

function VoiceInputWithResult({
	expectedText,
	onCorrect,
}: {
	expectedText: string;
	onCorrect: () => void;
}) {
	const [userInput, setUserInput] = useState("");

	const handleTranscription = (text: string) => {
		setUserInput(text);
		// Simple fuzzy match for voice - exact match too strict
		const normalized = (s: string) =>
			s
				.toLowerCase()
				.replace(/[.,!?;]/g, "")
				.trim();
		if (normalized(text) === normalized(expectedText)) {
			setTimeout(() => onCorrect(), 500);
		}
	};

	return (
		<>
			<ListenButton onTranscription={handleTranscription} size="large" />
			<div className="mt-8 h-8">
				{userInput && (
					<ResultVoiceIndicator
						key={userInput}
						transcription={userInput}
						expectedText={expectedText}
						hideExpected
						isNew
					/>
				)}
			</div>
		</>
	);
}

function SpeakPracticeComponent() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();

	const entry = A1[slug] as DictationEntry;
	const [currentIndex, setCurrentIndex] = useState(0);

	if (!entry) {
		return <div>Story not found</div>;
	}

	const currentSentence = entry.story[currentIndex];
	const isLastSentence = currentIndex === entry.story.length - 1;
	const progress = `${currentIndex + 1} / ${entry.story.length}`;

	const handleCorrect = () => {
		// No-op: we don't block anymore
	};

	const handleNext = () => {
		if (isLastSentence) {
			navigate({ to: "/dictation" });
		} else {
			setCurrentIndex((prev) => prev + 1);
		}
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
								<h2 className="text-center font-bold text-5xl text-warm-cream">
									{currentSentence.vn}
								</h2>
							</div>
							<div className="flex flex-col items-center space-y-4">
								<VoiceInputWithResult
									expectedText={currentSentence.vn}
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
							<div />
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
