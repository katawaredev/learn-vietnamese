import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { PracticeModeToggle } from "~/components/PracticeModeToggle";
import {
	ResultTextIndicator,
	ResultVoiceIndicator,
} from "~/components/ResultIndicator";
import { SpeakButton } from "~/components/SpeakButton";
import { WordInput } from "~/components/WordInput";
import consonantsData from "~/data/pronunciation/consonants.json";
import doubleVowelsData from "~/data/pronunciation/double-vowels.json";
import tones from "~/data/pronunciation/tones.json";
import vowelsData from "~/data/pronunciation/vowels.json";
import { getRandomElement, pickOne } from "~/utils/random";
import { Layout } from "./-layout";

interface PracticeItem {
	key: string;
	display: "sound" | "text";
}

function aggregatePronunciationData() {
	const allData = [
		...Object.entries(consonantsData),
		...Object.entries(vowelsData),
		...Object.entries(doubleVowelsData),
		...Object.values(tones).flatMap((tone) =>
			Object.entries(
				(tone as { examples?: Record<string, unknown> }).examples || {},
			),
		),
	];

	return allData
		.filter(([_, value]) => value && typeof value === "object")
		.map(([key]) => key);
}

const getRandomPracticeItem = createServerFn({ method: "GET" }).handler(
	async (): Promise<PracticeItem> => {
		const keys = aggregatePronunciationData();
		const key = getRandomElement(keys);
		const display = pickOne("sound", "text");
		return { key, display };
	},
);

export const Route = createFileRoute("/pronunciation/practice")({
	component: PracticeComponent,
	loader: async () => await getRandomPracticeItem(),
});

function ListenPractice({
	itemKey,
	hint,
	onInputChange,
}: {
	itemKey: string;
	hint: string;
	onInputChange: (value: string) => void;
}) {
	const [userInput, setUserInput] = useState("");

	const showResult = userInput.length === itemKey.length;

	const handleChange = (value: string) => {
		setUserInput(value);
		onInputChange(value);
	};

	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500">
			<SpeakButton text={itemKey} size="large" />
			<div className="flex flex-col items-center space-y-4">
				<WordInput
					text={itemKey}
					hint={hint}
					onChange={handleChange}
					autoFocus
				/>
				<div className="mt-8 h-8">
					{showResult && (
						<ResultTextIndicator
							key={userInput}
							inputText={userInput}
							expectedText={itemKey}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function SpeakPractice({ itemKey }: { itemKey: string }) {
	const [userInput, setUserInput] = useState("");

	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500">
			<h2 className="font-bold text-5xl">{itemKey}</h2>
			<div className="flex flex-col items-center space-y-4">
				<ListenButton onTranscription={setUserInput} size="large" />
				<div className="mt-8 h-8">
					{userInput && (
						<ResultVoiceIndicator
							key={userInput}
							transcription={userInput}
							expectedText={itemKey}
							isNew
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function PracticeComponent() {
	const initialItem = Route.useLoaderData() as {
		key: string;
		display: "sound" | "text";
	};
	const [item, setItem] = useState(initialItem);
	const [hint, setHint] = useState("");
	const [mode, setMode] = useState<string[]>(["random"]);

	const handleNext = async () => {
		const newItem = await getRandomPracticeItem();
		setItem(newItem);
		setHint("");
	};

	const handleModeChange = async (newMode: string[]) => {
		setMode(newMode);
		// Fetch a new word when mode changes
		const newItem = await getRandomPracticeItem();
		setItem(newItem);
		setHint("");
	};

	const handleHint = () => {
		const currentHint = hint || " ".repeat(item.key.length);
		const unrevealed = item.key
			.split("")
			.map((_c: string, i: number) => (currentHint[i] === " " ? i : -1))
			.filter((i: number) => i !== -1);

		if (unrevealed.length === 0) return;

		const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
		const newHint = item.key
			.split("")
			.map((c: string, i: number) =>
				i === idx || currentHint[i] !== " " ? c : " ",
			)
			.join("");
		setHint(newHint);
	};

	// Determine display mode based on toggle selection
	const currentMode = mode[0] || "random";
	const displayMode =
		currentMode === "type"
			? "sound"
			: currentMode === "speak"
				? "text"
				: item.display;

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
					{displayMode === "sound" &&
					hint.replace(/\s/g, "").length < item.key.length ? (
						<Button variant="outline" size="medium" onClick={handleHint}>
							Hint
						</Button>
					) : (
						<div />
					)}
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
				{displayMode === "sound" ? (
					<ListenPractice
						key={item.key}
						itemKey={item.key}
						hint={hint}
						onInputChange={() => {}}
					/>
				) : (
					<SpeakPractice key={item.key} itemKey={item.key} />
				)}
			</div>
		</Layout>
	);
}
