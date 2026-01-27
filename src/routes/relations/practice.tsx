import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button, LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { PracticeModeToggle } from "~/components/PracticeModeToggle";
import {
	ResultTextIndicator,
	ResultVoiceIndicator,
} from "~/components/ResultIndicator";
import { WordInputSingle } from "~/components/WordInputSingle";
import practiceData from "~/data/relations/practice.json";
import { getRandomElement, pickOne } from "~/utils/random";
import { Layout } from "./-layout";

// Utilities
const getUnrevealedIndices = (hintPart: string, expectedPart: string) =>
	expectedPart
		.split("")
		.map((_, i) => (hintPart[i] === " " ? i : -1))
		.filter((i) => i !== -1);

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
	scenario: string;
	expected: string[];
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
	const [hintParts, setHintParts] = useState<string[]>([]);
	const [mode, setMode] = useState<string[]>(["random"]);

	const handleNext = async () => {
		const newItem = await getRandomPracticeItem();
		setItem(newItem);
		setHintParts([]);
	};

	const handleModeChange = (newMode: string[]) => {
		setMode(newMode);
	};

	const handleHint = () => {
		const currentHintParts =
			hintParts.length > 0
				? hintParts
				: item.expected.map((exp) => " ".repeat(exp.length));

		const partsWithUnrevealed = currentHintParts
			.map((hintPart, idx) => ({
				idx,
				unrevealed: getUnrevealedIndices(hintPart, item.expected[idx]),
			}))
			.filter(({ unrevealed }) => unrevealed.length > 0);

		if (partsWithUnrevealed.length === 0) return;

		const { idx: partIdx, unrevealed } = getRandomElement(partsWithUnrevealed);
		const charIdx = getRandomElement(unrevealed);

		const updatedParts = currentHintParts.map((hintPart, idx) => {
			if (idx !== partIdx) return hintPart;
			return item.expected[idx]
				.split("")
				.map((c, i) => (i === charIdx || hintPart[i] !== " " ? c : " "))
				.join("");
		});

		setHintParts(updatedParts);
	};

	const userPreference = mode[0] ?? "random";
	const inputMethod = getInputMethod(userPreference, item.display);
	const hintsExhausted =
		hintParts.length > 0 &&
		hintParts.every(
			(h, i) => h.replace(/\s/g, "").length === item.expected[i].length,
		);
	const showHintButton = !hintsExhausted;

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
			<div className="flex w-full flex-row justify-center pt-8 pb-4">
				<PracticeModeToggle value={mode} onValueChange={handleModeChange} />
			</div>
			<div className="flex flex-1 items-center">
				<Practice
					key={`${item.scenario}-${item.expected.join("-")}`}
					scenario={item.scenario}
					expected={item.expected}
					hintParts={hintParts}
					inputMethod={inputMethod}
				/>
			</div>
		</Layout>
	);
}

function Practice({
	scenario,
	expected,
	hintParts: hintPartsFromProps,
	inputMethod,
}: Omit<PracticeItem, "display"> & {
	hintParts: string[];
	inputMethod: "type" | "speak";
}) {
	const hintParts =
		hintPartsFromProps.length > 0
			? hintPartsFromProps
			: expected.map((exp) => " ".repeat(exp.length));

	return (
		<div className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500">
			<div className="space-y-6 text-center text-xl">{scenario}</div>
			<div className="flex flex-col items-center space-y-4">
				<div className="flex items-center gap-4 text-3xl">
					{expected.map((exp, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is stable for this use case
						<span key={i} className="flex items-center gap-4">
							{inputMethod === "type" ? (
								<TypeInput
									expectedText={exp}
									textHint={hintParts[i]}
									index={i}
								/>
							) : (
								<SpeakInput expectedText={exp} textHint={hintParts[i]} />
							)}
							{i < expected.length - 1 && (
								<span className="text-2xl opacity-50">→</span>
							)}
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
	index,
}: {
	expectedText: string;
	textHint: string;
	index: number;
}) {
	const [userInput, setUserInput] = useState("");

	const isFilled = userInput.length === expectedText.length;

	return (
		<span className="relative inline-block">
			<WordInputSingle
				className={twMerge("-mr-[3ch] inline-block", index === 1 && "ml-[1ch]")}
				text={expectedText}
				hint={textHint}
				onChange={setUserInput}
			/>
			{isFilled && (
				<span className="absolute -right-2 -bottom-6">
					<ResultTextIndicator
						size="small"
						key={userInput}
						inputText={userInput}
						expectedText={expectedText}
					/>
				</span>
			)}
		</span>
	);
}

function SpeakInput({
	expectedText,
	textHint,
}: {
	expectedText: string;
	textHint: string;
}) {
	const [userTranscription, setUserTranscription] = useState("");
	return (
		<span className="relative inline-flex flex-col items-center">
			<ListenButton
				className="mx-2 inline-flex"
				onTranscription={setUserTranscription}
				size="small"
			/>
			{userTranscription && (
				<span className="absolute -right-1 -bottom-6 scale-75">
					<ResultVoiceIndicator
						key={userTranscription}
						transcription={userTranscription}
						expectedText={expectedText}
						isNew
						hideExpected
					/>
				</span>
			)}
			<span className="mt-1 h-1 font-mono text-xs tracking-widest opacity-60">
				{textHint}
			</span>
		</span>
	);
}
