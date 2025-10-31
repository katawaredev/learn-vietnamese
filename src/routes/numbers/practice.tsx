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
import { dayOfWeekToText, formatDate, monthToText } from "~/utils/dates";
import { numberToText } from "~/utils/numeric";
import { pickOne } from "~/utils/random";
import {
	DURATION_UNITS,
	type DurationUnit,
	formatDuration,
	formatTime,
} from "~/utils/time";
import { Layout } from "./-layout";

type DisplayMode = "number" | "text" | "audio";
type InputMode = "type" | "voice";
type PracticeMode = "random" | "speak" | "type";
type PracticeType = "number" | "date" | "time" | "duration";

interface PracticeItem {
	type: PracticeType;
	display: DisplayMode;
	inputMethod: InputMode;
	// For numbers
	number?: number;
	// For dates
	date?: {
		day?: number;
		month?: number;
		year?: number;
		dayOfWeek?: number;
		type: "month" | "dayOfWeek" | "fullDate";
	};
	// For time
	time?: {
		hour?: number;
		minute?: number;
		type: "hour" | "minute" | "fullTime" | "period";
	};
	// For duration
	duration?: {
		value: number;
		unit: DurationUnit;
	};
}

function getWeightedRandomNumber(): number {
	const rand = Math.random();
	if (rand < 0.6) return Math.floor(Math.random() * 101); // 60%: 0-100
	if (rand < 0.87) return 101 + Math.floor(Math.random() * 900); // 27%: 101-1,000
	if (rand < 0.95) return 1_001 + Math.floor(Math.random() * 99_000); // 8%: 1,001-100,000
	return 100_001 + Math.floor(Math.random() * 9_999_900_000); // 5%: 100,001-10B
}

function getRandomDateItem(): PracticeItem["date"] {
	const dateType = pickOne<"month" | "dayOfWeek" | "fullDate">(
		"month",
		"dayOfWeek",
		"fullDate",
	);

	if (dateType === "month") {
		return {
			month: Math.floor(Math.random() * 12) + 1, // 1-12
			type: "month",
		};
	}

	if (dateType === "dayOfWeek") {
		return {
			dayOfWeek: Math.floor(Math.random() * 7), // 0-6
			type: "dayOfWeek",
		};
	}

	// fullDate
	return {
		day: Math.floor(Math.random() * 28) + 1, // 1-28 (safe for all months)
		month: Math.floor(Math.random() * 12) + 1, // 1-12
		year:
			Math.random() < 0.5 ? undefined : 2020 + Math.floor(Math.random() * 10), // 50% chance of year
		type: "fullDate",
	};
}

function getRandomTimeItem(): PracticeItem["time"] {
	const timeType = pickOne<"hour" | "minute" | "fullTime" | "period">(
		"hour",
		"minute",
		"fullTime",
		"fullTime", // Weight fullTime more
	);

	if (timeType === "hour") {
		return {
			hour: Math.floor(Math.random() * 12) + 1, // 1-12
			type: "hour",
		};
	}

	if (timeType === "minute") {
		// Common minutes: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
		const minutes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
		return {
			minute: minutes[Math.floor(Math.random() * minutes.length)],
			type: "minute",
		};
	}

	if (timeType === "period") {
		// Not implemented for now, fall through to fullTime
	}

	// fullTime
	const hour = Math.floor(Math.random() * 24); // 0-23
	const minuteOptions = [0, 15, 30, 45]; // Common times
	const minute =
		minuteOptions[Math.floor(Math.random() * minuteOptions.length)];

	return {
		hour,
		minute,
		type: "fullTime",
	};
}

function getRandomDurationItem(): PracticeItem["duration"] {
	const units: DurationUnit[] = [
		"giây",
		"phút",
		"giờ",
		"ngày",
		"tuần",
		"tháng",
		"năm",
	];
	const unit = units[Math.floor(Math.random() * units.length)];

	// Generate appropriate values based on unit
	let maxValue: number;
	switch (unit) {
		case "giây":
			maxValue = 59;
			break;
		case "phút":
			maxValue = 59;
			break;
		case "giờ":
			maxValue = 24;
			break;
		case "ngày":
			maxValue = 30;
			break;
		case "tuần":
			maxValue = 12;
			break;
		case "tháng":
			maxValue = 24;
			break;
		case "năm":
			maxValue = 10;
			break;
	}

	const value = Math.floor(Math.random() * maxValue) + 1;

	return { value, unit };
}

const getRandomPracticeItem = createServerFn({ method: "GET" }).handler(
	async (): Promise<PracticeItem> => {
		const practiceType = pickOne<PracticeType>(
			"number",
			"date",
			"time",
			"duration",
		);

		if (practiceType === "number") {
			const number = getWeightedRandomNumber();
			const display = pickOne<DisplayMode>("number", "text", "audio");
			const inputMethod =
				display === "text" ? "type" : pickOne<InputMode>("type", "voice");

			return {
				type: "number",
				number,
				display,
				inputMethod,
			};
		}

		if (practiceType === "date") {
			const date = getRandomDateItem();
			const display = pickOne<DisplayMode>("number", "text", "audio");
			const inputMethod =
				display === "text" ? "type" : pickOne<InputMode>("type", "voice");

			return {
				type: "date",
				date,
				display,
				inputMethod,
			};
		}

		if (practiceType === "time") {
			const time = getRandomTimeItem();
			const display = pickOne<DisplayMode>("number", "text", "audio");
			const inputMethod =
				display === "text" ? "type" : pickOne<InputMode>("type", "voice");

			return {
				type: "time",
				time,
				display,
				inputMethod,
			};
		}

		// duration
		const duration = getRandomDurationItem();
		const display = pickOne<DisplayMode>("number", "text", "audio");
		const inputMethod =
			display === "text" ? "type" : pickOne<InputMode>("type", "voice");

		return {
			type: "duration",
			duration,
			display,
			inputMethod,
		};
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

function getDisplayText(item: PracticeItem): string {
	if (item.type === "number" && item.number !== undefined) {
		return numberToText(item.number);
	}

	if (item.type === "date" && item.date) {
		const { date } = item;
		if (date.type === "month" && date.month !== undefined) {
			return monthToText(date.month);
		}
		if (date.type === "dayOfWeek" && date.dayOfWeek !== undefined) {
			return dayOfWeekToText(date.dayOfWeek);
		}
		if (date.type === "fullDate" && date.day && date.month) {
			return formatDate(date.day, date.month, date.year);
		}
	}

	if (item.type === "time" && item.time) {
		const { time } = item;
		if (time.type === "hour" && time.hour !== undefined) {
			return `${numberToText(time.hour)} giờ`;
		}
		if (time.type === "minute" && time.minute !== undefined) {
			if (time.minute === 30) return "rưỡi";
			return `${numberToText(time.minute)} phút`;
		}
		if (
			time.type === "fullTime" &&
			time.hour !== undefined &&
			time.minute !== undefined
		) {
			return formatTime(time.hour, time.minute, false);
		}
	}

	if (item.type === "duration" && item.duration) {
		return formatDuration(item.duration.value, item.duration.unit);
	}

	return "";
}

function getDisplayNumber(item: PracticeItem): string | number {
	if (item.type === "number" && item.number !== undefined) {
		return item.number.toLocaleString();
	}

	if (item.type === "date" && item.date) {
		const { date } = item;
		if (date.type === "month" && date.month !== undefined) {
			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			return monthNames[date.month - 1];
		}
		if (date.type === "dayOfWeek" && date.dayOfWeek !== undefined) {
			const dayNames = [
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
				"Sunday",
			];
			return dayNames[date.dayOfWeek];
		}
		if (date.type === "fullDate" && date.day && date.month) {
			const monthNames = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];
			return date.year
				? `${monthNames[date.month - 1]} ${date.day}, ${date.year}`
				: `${monthNames[date.month - 1]} ${date.day}`;
		}
	}

	if (item.type === "time" && item.time) {
		const { time } = item;
		if (time.type === "hour" && time.hour !== undefined) {
			return `${time.hour}:00`;
		}
		if (time.type === "minute" && time.minute !== undefined) {
			return `${time.minute} min`;
		}
		if (
			time.type === "fullTime" &&
			time.hour !== undefined &&
			time.minute !== undefined
		) {
			const h12 = time.hour % 12 || 12;
			const ampm = time.hour < 12 ? "AM" : "PM";
			return `${h12}:${time.minute.toString().padStart(2, "0")} ${ampm}`;
		}
	}

	if (item.type === "duration" && item.duration) {
		return `${item.duration.value} ${DURATION_UNITS[item.duration.unit]}`;
	}

	return "";
}

function UnifiedPractice({
	item,
	displayMode,
	inputMode,
}: {
	item: PracticeItem;
	displayMode: DisplayMode;
	inputMode: InputMode;
}) {
	// Hook must be called unconditionally at top level
	const [typeDigits] = useState(() => Math.random() < 0.5);

	const vietnameseText = getDisplayText(item);
	const displayNumber = getDisplayNumber(item);

	// Determine what to display
	let displayElement: ReactNode;
	if (displayMode === "text") {
		displayElement = (
			<h2 className="text-center font-bold text-5xl">{vietnameseText}</h2>
		);
	} else if (displayMode === "number") {
		displayElement = <h2 className="font-bold text-5xl">{displayNumber}</h2>;
	} else {
		// audio
		displayElement = <SpeakButton text={vietnameseText} size="large" />;
	}

	// Determine what input method to show and expected text
	let inputElement: ReactNode;
	let expectedText: string;

	if (displayMode === "text") {
		// Show Vietnamese text → user types English/digits
		expectedText = displayNumber.toString();
		inputElement = <TextInputWithResult expectedText={expectedText} />;
	} else if (displayMode === "audio") {
		// Show SpeakButton → user types digits/English OR Vietnamese (50/50)
		expectedText = typeDigits ? displayNumber.toString() : vietnameseText;
		inputElement = <TextInputWithResult expectedText={expectedText} />;
	} else if (inputMode === "type") {
		// Show number/English → user types Vietnamese
		expectedText = vietnameseText;
		inputElement = <TextInputWithResult expectedText={expectedText} />;
	} else {
		// Show number/English → user speaks Vietnamese
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

	// Generate unique key for proper remounting
	const itemKey = `${item.type}-${JSON.stringify(item.number || item.date || item.time || item.duration)}-${displayMode}-${inputMode}`;

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
					key={itemKey}
					item={item}
					displayMode={displayMode}
					inputMode={inputMode}
				/>
			</div>
		</Layout>
	);
}
