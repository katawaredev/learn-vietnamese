import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type ReactNode, useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { PracticeModeToggle } from "~/components/PracticeModeToggle";
import {
	ResultTextIndicator,
	ResultVoiceIndicator,
} from "~/components/ResultIndicator";
import { SpeakButton } from "~/components/SpeakButton";
import { WordInput } from "~/components/WordInput";
import { numberToText } from "~/utils/numeric";
import { pickOne } from "~/utils/random";
import { Layout } from "./-layout";

type DisplayMode = "number" | "text" | "audio";
type InputMode = "type" | "voice";
type PracticeMode = "random" | "speak" | "type";

interface PracticeItem {
	number: number;
	display: DisplayMode;
	inputMethod: InputMode;
}

function getWeightedRandomNumber(): number {
	const rand = Math.random();
	if (rand < 0.6) return Math.floor(Math.random() * 101); // 60%: 0-100
	if (rand < 0.87) return 101 + Math.floor(Math.random() * 900); // 27%: 101-1,000
	if (rand < 0.95) return 1_001 + Math.floor(Math.random() * 99_000); // 8%: 1,001-100,000
	return 100_001 + Math.floor(Math.random() * 9_999_900_000); // 5%: 100,001-10B
}

const getRandomPracticeItem = createServerFn({ method: "GET" }).handler(
	async (): Promise<PracticeItem> => {
		const number = getWeightedRandomNumber();
		const display = pickOne<DisplayMode>("number", "text", "audio");
		const inputMethod =
			display === "text" ? "type" : pickOne<InputMode>("type", "voice");
		return { number, display, inputMethod };
	},
);

export const Route = createFileRoute("/numbers/practice")({
	component: PracticeComponent,
	loader: async () => await getRandomPracticeItem(),
});

function PracticeContainer({
	displayElement,
	inputElement,
}: {
	displayElement: ReactNode;
	inputElement: ReactNode;
}) {
	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500">
			{displayElement}
			<div className="flex flex-col items-center space-y-4">{inputElement}</div>
		</div>
	);
}

function TextInputWithResult({
	expectedText,
	onInputChange,
}: {
	expectedText: string;
	onInputChange?: (value: string) => void;
}) {
	const [userInput, setUserInput] = useState("");
	const showResult = userInput.length === expectedText.length;

	const handleChange = (value: string) => {
		setUserInput(value);
		onInputChange?.(value);
	};

	return (
		<>
			<WordInput
				className="ml-[6ch] justify-center"
				text={expectedText}
				onChange={handleChange}
			/>
			<div className="mt-8 h-8">
				{showResult && (
					<ResultTextIndicator
						key={userInput}
						inputText={userInput}
						expectedText={expectedText}
					/>
				)}
			</div>
		</>
	);
}

function VoiceInputWithResult({ expectedText }: { expectedText: string }) {
	const [userInput, setUserInput] = useState("");

	return (
		<>
			<ListenButton onTranscription={setUserInput} size="large" />
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

function UnifiedPractice({
	number,
	vietnameseText,
	displayMode,
	inputMode,
}: {
	number: number;
	vietnameseText: string;
	displayMode: DisplayMode;
	inputMode: InputMode;
}) {
	// Hook must be called unconditionally at top level
	const [typeDigits] = useState(() => Math.random() < 0.5);

	// Determine what to display
	let displayElement: ReactNode;
	if (displayMode === "text") {
		displayElement = (
			<h2 className="text-center font-bold text-5xl">{vietnameseText}</h2>
		);
	} else if (displayMode === "number") {
		displayElement = (
			<h2 className="font-bold text-5xl">{number.toLocaleString()}</h2>
		);
	} else {
		// audio
		displayElement = <SpeakButton text={vietnameseText} size="large" />;
	}

	// Determine what input method to show and expected text
	let inputElement: ReactNode;
	let expectedText: string;

	if (displayMode === "text") {
		// Show Vietnamese text → user types digits
		expectedText = number.toString();
		inputElement = <TextInputWithResult expectedText={expectedText} />;
	} else if (displayMode === "audio") {
		// Show SpeakButton → user types digits OR Vietnamese (50/50)
		expectedText = typeDigits ? number.toString() : vietnameseText;
		inputElement = <TextInputWithResult expectedText={expectedText} />;
	} else if (inputMode === "type") {
		// Show number → user types Vietnamese
		expectedText = vietnameseText;
		inputElement = <TextInputWithResult expectedText={expectedText} />;
	} else {
		// Show number → user speaks Vietnamese
		expectedText = vietnameseText;
		inputElement = <VoiceInputWithResult expectedText={expectedText} />;
	}

	return (
		<PracticeContainer
			displayElement={displayElement}
			inputElement={inputElement}
		/>
	);
}

function PracticeComponent() {
	const initialItem = Route.useLoaderData();
	const [item, setItem] = useState(initialItem);
	const [mode, setMode] = useState<string[]>(["random"]);

	const vietnameseText = numberToText(item.number);

	const handleNext = async () => {
		const newItem = await getRandomPracticeItem();
		setItem(newItem);
	};

	const handleModeChange = async (newMode: string[]) => {
		setMode(newMode);
		const newItem = await getRandomPracticeItem();
		setItem(newItem);
	};

	// Map mode to display/input constraints
	const currentMode = (mode[0] || "random") as PracticeMode;
	let displayMode: DisplayMode;
	let inputMode: InputMode;

	if (currentMode === "speak") {
		displayMode = "number";
		inputMode = "voice";
	} else if (currentMode === "type") {
		displayMode = item.display;
		inputMode = "type";
	} else {
		displayMode = item.display;
		inputMode = item.inputMethod;
	}

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
					<div />
					<Button variant="outline" size="medium" onClick={handleNext}>
						Next
					</Button>
				</div>
			)}
		>
			<div className="flex w-full flex-row justify-center pt-8 pb-4">
				<PracticeModeToggle value={mode} onValueChange={handleModeChange} />
			</div>
			<div className="flex flex-1 items-center">
				<UnifiedPractice
					key={item.number}
					number={item.number}
					vietnameseText={vietnameseText}
					displayMode={displayMode}
					inputMode={inputMode}
				/>
			</div>
		</Layout>
	);
}
