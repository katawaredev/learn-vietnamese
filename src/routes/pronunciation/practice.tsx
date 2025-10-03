import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Check, Dices, Keyboard, Mic, X } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { Result } from "~/components/ResultButton";
import { SpeakButton } from "~/components/SpeakButton";
import { Toggle, ToggleGroup } from "~/components/ToggleGroup";
import { WordInputSingle } from "~/components/WordInputSingle";
import consonantsData from "~/data/pronunciation/consonants.json";
import doubleVowelsData from "~/data/pronunciation/double-vowels.json";
import tones from "~/data/pronunciation/tones.json";
import vowelsData from "~/data/pronunciation/vowels.json";
import {
	PronunciationLayout,
	pronunciationRoutes,
} from "~/layout/PronunciationLayout";

interface PracticeItem {
	key: string;
	display: "sound" | "text";
}

const normalizeText = (text: string) =>
	text
		.replace(/[^a-zA-Z0-9\s]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();

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
		const key = keys[Math.floor(Math.random() * keys.length)];
		const display = Math.random() < 0.5 ? "sound" : "text";
		return { key, display };
	},
);

export const Route = createFileRoute("/pronunciation/practice")({
	component: PracticeComponent,
	loader: async () => {
		const item = await getRandomPracticeItem();
		return item;
	},
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

	const isCorrect =
		userInput.length === itemKey.length &&
		normalizeText(userInput) === normalizeText(itemKey);

	const showResult = userInput.length === itemKey.length;
	const animationClass = showResult
		? isCorrect
			? "animate-stamp"
			: "animate-shake"
		: "";

	const handleChange = (value: string) => {
		setUserInput(value);
		onInputChange(value);
	};

	return (
		<div
			key={itemKey}
			className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500"
		>
			<SpeakButton text={itemKey} size="large" />
			<div className="flex flex-col items-center space-y-4">
				<WordInputSingle
					key={itemKey}
					text={itemKey}
					hint={hint}
					onChange={handleChange}
				/>
				<div className="mt-8 h-8">
					{showResult && (
						<div className={animationClass}>
							{isCorrect ? (
								<Check className="h-8 w-8 text-green-400" />
							) : (
								<X className="h-8 w-8 text-red-400" />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function SpeakPractice({ itemKey }: { itemKey: string }) {
	const [userInput, setUserInput] = useState("");

	return (
		<div
			key={itemKey}
			className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500"
		>
			<h2 className="font-bold text-5xl">{itemKey}</h2>
			<div className="flex flex-col items-center space-y-4">
				<ListenButton onTranscription={setUserInput} size="large" />
				<div className="mt-8 h-8">
					{userInput && (
						<Result transcription={userInput} expectedText={itemKey} isNew />
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

	const prevRoute = pronunciationRoutes.find((r) => r.value === "tones-vowel");

	// Determine display mode based on toggle selection
	const currentMode = mode[0] || "random";
	const displayMode =
		currentMode === "type"
			? "sound"
			: currentMode === "speak"
				? "text"
				: item.display;

	const customNav = (
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
	);

	return (
		<PronunciationLayout currentRoute="practice" customNavigation={customNav}>
			<div className="flex flex-col items-center space-y-20">
				<ToggleGroup
					value={mode}
					onValueChange={(value) => handleModeChange(value)}
				>
					<Toggle value="random" size="medium" orientation="horizontal">
						<Dices className="h-5 w-5" />
						<span>Random</span>
					</Toggle>
					<Toggle value="speak" size="medium" orientation="horizontal">
						<Mic className="h-5 w-5" />
						<span>Speak</span>
					</Toggle>
					<Toggle value="type" size="medium" orientation="horizontal">
						<Keyboard className="h-5 w-5" />
						<span>Type</span>
					</Toggle>
				</ToggleGroup>
				{displayMode === "sound" ? (
					<ListenPractice
						itemKey={item.key}
						hint={hint}
						onInputChange={() => {}}
					/>
				) : (
					<SpeakPractice itemKey={item.key} />
				)}
			</div>
		</PronunciationLayout>
	);
}
