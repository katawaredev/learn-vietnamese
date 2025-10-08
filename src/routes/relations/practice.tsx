import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Dices, Keyboard, Mic } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import {
	ResultTextIndicator,
	ResultVoiceIndicator,
} from "~/components/ResultIndicator";
import { Toggle, ToggleGroup } from "~/components/ToggleGroup";
import { WordInputSingle } from "~/components/WordInputSingle";
import practiceData from "~/data/relations/practice.json";
import { getRandomElement, pickOne } from "~/utils/random";
import { Layout } from "./-layout";

// Constants
const PARTS_SEPARATOR = " / ";
const PLACEHOLDER = "???";

// Utilities
const splitIntoParts = (text: string) =>
	text.split(PARTS_SEPARATOR).map((s) => s.trim());

const getUnrevealedIndices = (hintPart: string, expectedPart: string) =>
	expectedPart
		.split("")
		.map((_, i) => (hintPart[i] === " " ? i : -1))
		.filter((i) => i !== -1);

const createHintParts = (hint: string, expectedParts: string[]) =>
	hint
		? splitIntoParts(hint)
		: expectedParts.map((exp) => " ".repeat(exp.length));

const areHintsExhausted = (hint: string, expected: string) => {
	if (!hint) return false;
	return splitIntoParts(hint).every(
		(h, i) =>
			h.replace(/\s/g, "").length === splitIntoParts(expected)[i].length,
	);
};

const getInputMethod = (
	userPreference: string,
	itemDisplay: "sound" | "text",
): "type" | "speak" => {
	if (userPreference === "type") return "type";
	if (userPreference === "speak") return "speak";
	// Random: if item shows sound, user types; if text, user speaks
	return itemDisplay === "sound" ? "type" : "speak";
};

interface PracticeItem {
	target: string;
	text: string;
	translation: string;
	expected: string;
	hint?: string | null | undefined;
	display: "sound" | "text";
}

const getRandomPracticeItem = createServerFn({ method: "GET" }).handler(
	async (): Promise<PracticeItem> => {
		const item = getRandomElement(practiceData);
		const display = pickOne("sound", "text");
		return { ...item, display };
	},
);

export const Route = createFileRoute("/relations/practice")({
	component: PracticeComponent,
	loader: () => getRandomPracticeItem(),
});

function PracticeComponent() {
	const initialItem = Route.useLoaderData() as PracticeItem;
	const [item, setItem] = useState(initialItem);
	const [hint, setHint] = useState("");
	const [mode, setMode] = useState<string[]>(["random"]);

	const handleNext = async () => {
		const newItem = await getRandomPracticeItem();
		setItem(newItem);
		setHint("");
	};

	const handleModeChange = (newMode: string[]) => {
		setMode(newMode);
	};

	const handleHint = () => {
		const expectedParts = splitIntoParts(item.expected);
		const currentHintParts = createHintParts(hint, expectedParts);

		const partsWithUnrevealed = currentHintParts
			.map((hintPart, idx) => ({
				idx,
				unrevealed: getUnrevealedIndices(hintPart, expectedParts[idx]),
			}))
			.filter(({ unrevealed }) => unrevealed.length > 0);

		if (partsWithUnrevealed.length === 0) return;

		const { idx: partIdx, unrevealed } = getRandomElement(partsWithUnrevealed);
		const charIdx = getRandomElement(unrevealed);

		const updatedParts = currentHintParts.map((hintPart, idx) => {
			if (idx !== partIdx) return hintPart;
			return expectedParts[idx]
				.split("")
				.map((c, i) => (i === charIdx || hintPart[i] !== " " ? c : " "))
				.join("");
		});

		setHint(updatedParts.join(PARTS_SEPARATOR));
	};

	const userPreference = mode[0] ?? "random";
	const inputMethod = getInputMethod(userPreference, item.display);
	const hintsExhausted = areHintsExhausted(hint, item.expected);
	const showHintButton = inputMethod === "type" && !hintsExhausted;

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
					{showHintButton ? (
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
			<div className="flex flex-col items-center space-y-20">
				<ToggleGroup value={mode} onValueChange={handleModeChange}>
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
				<Practice
					key={`${item.target}-${item.expected}`}
					target={item.target}
					text={item.text}
					translation={item.translation}
					expected={item.expected}
					hint={item.hint}
					textHint={hint}
					inputMethod={inputMethod}
				/>
			</div>
		</Layout>
	);
}

function Practice({
	target,
	text,
	translation,
	expected,
	hint,
	textHint,
	inputMethod,
}: Omit<PracticeItem, "display"> & {
	textHint: string;
	inputMethod: "type" | "speak";
}) {
	const textParts = text.split(PLACEHOLDER);
	const expectedParts = splitIntoParts(expected);
	const hintParts = createHintParts(textHint, expectedParts);

	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500">
			<div className="space-y-6 text-center text-xl">
				<div>{target}</div>
				<div>{translation}</div>
			</div>
			<div className="flex flex-col items-center space-y-4">
				<div className="text-3xl">
					{textParts.map((part, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: part is not a viable key
						<span key={i}>
							{part}
							{i < expectedParts.length &&
								(inputMethod === "type" ? (
									<TypeInput
										expectedText={expectedParts[i]}
										textHint={hintParts[i]}
										hint={hint}
									/>
								) : (
									<SpeakInput hint={hint} expectedText={expectedParts[i]} />
								))}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}

function TypeInput({
	expectedText,
	textHint,
	hint,
}: {
	expectedText: string;
	textHint: string;
} & Pick<PracticeItem, "hint">) {
	const [userInput, setUserInput] = useState("");

	const isFilled = userInput.length === expectedText.length;

	return (
		<span className="relative inline-block">
			<WordInputSingle
				className="-mr-[3ch] inline-block"
				text={expectedText}
				hint={textHint}
				onChange={setUserInput}
			/>
			{isFilled && (
				<span className="-bottom-6 -right-2 absolute">
					<ResultTextIndicator
						size="small"
						key={userInput}
						inputText={userInput}
						expectedText={expectedText}
						hint={hint}
					/>
				</span>
			)}
		</span>
	);
}

function SpeakInput({
	expectedText,
	hint,
}: { expectedText: string } & Pick<PracticeItem, "hint">) {
	const [userTranscription, setUserTranscription] = useState("");

	return (
		<span className="relative inline-block">
			<ListenButton
				className="mx-2 inline-flex"
				onTranscription={setUserTranscription}
				size="small"
			/>
			{userTranscription && (
				<span className="-bottom-6 -right-1 absolute scale-75">
					<ResultVoiceIndicator
						key={userTranscription}
						transcription={userTranscription}
						expectedText={expectedText}
						isNew
						hideExpected
						hint={hint}
					/>
				</span>
			)}
		</span>
	);
}
