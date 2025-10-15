import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ListenButton } from "~/components/ListenButton";
import { ResultVoiceIndicator } from "~/components/ResultIndicator";
import { DictationLayout, useDictationPractice, validateSlug } from "./-layout";

export const Route = createFileRoute("/dictation/speak/$slug")({
	beforeLoad: ({ params }) => {
		const { slug } = params;

		// Verify slug exists in data
		if (!validateSlug(slug)) {
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

	const practice = useDictationPractice({ slug });

	if (!practice) {
		return <div>Story not found</div>;
	}

	const { entry, currentIndex, currentSentence, setCurrentIndex } = practice;

	const handleCorrect = () => {
		// No-op: we don't block anymore
	};

	return (
		<DictationLayout
			entry={entry}
			currentIndex={currentIndex}
			onIndexChange={setCurrentIndex}
			practiceContent={
				<h2 className="text-center font-bold text-5xl text-warm-cream">
					{currentSentence.vn}
				</h2>
			}
			translationContent={<code>{currentSentence.en}</code>}
			inputContent={
				<VoiceInputWithResult
					expectedText={currentSentence.vn}
					onCorrect={handleCorrect}
				/>
			}
		/>
	);
}
