import { cva } from "class-variance-authority";
import { AudioLines, Check, ChevronDown, X } from "lucide-react";
import type { FC } from "react";
import { useSpeech } from "~/features/speech/provider";
import { localModels as availableLocalModels } from "~/features/speech/local/catalog";
import { selectionValue } from "~/features/speech/preferences";
import { normalizeText } from "~/utils/text";
import { Popover } from "./Popover";

enum TranscriptionResult {
	Success = "success",
	Fail = "fail",
	Silence = "silence",
}

const ANIMATION_CLASS: Record<TranscriptionResult, string> = {
	[TranscriptionResult.Success]: "animate-stamp",
	[TranscriptionResult.Silence]: "animate-pulse",
	[TranscriptionResult.Fail]: "animate-shake",
};

const AUDIO_SUGGESTIONS = [
	"Try speaking louder and slowing down",
	"Check that your microphone is working",
	"Reduce background noise",
	"Get closer to your microphone",
	"Try another recognition service in speech settings",
];

const SuggestionsPanel = () => {
	const { preferences, localModels, capabilities, setSelection } = useSpeech();

	const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelection("stt", "vn", event.target.value);
	};

	return (
		<div>
			<strong>Suggestions:</strong>
			<ul className="mb-3 list-inside list-disc space-y-1 text-sm">
				{AUDIO_SUGGESTIONS.map((suggestion) => (
					<li key={suggestion} className="text-warm-cream/90">
						{suggestion}
					</li>
				))}
			</ul>
			<div className="relative">
				<select
					className="block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark focus:outline-none"
					aria-label="Vietnamese recognition service"
					value={selectionValue(preferences, localModels, "stt", "vn")}
					onChange={handleModelChange}
				>
					{availableLocalModels("stt", "vn").map((model) => (
						<option key={model.id} value={model.id} className="text-black">
							{model.name}
						</option>
					))}
					<option value="browser" className="text-black">
						Browser recognition
					</option>
					{capabilities.stt && (
						<option value="server" className="text-black">
							Server recognition
						</option>
					)}
				</select>
				<ChevronDown
					className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-white/60"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
};

export interface ResultVoiceIndicatorProps {
	transcription?: string | null;
	expectedText: string;
	isNew?: boolean;
	hideExpected?: boolean;
}

export const ResultVoiceIndicator: FC<ResultVoiceIndicatorProps> = ({
	transcription,
	expectedText,
	isNew = false,
	hideExpected = false,
}) => {
	// Determine transcription result
	let result: TranscriptionResult;
	if (transcription === null) {
		result = TranscriptionResult.Silence;
	} else if (transcription === undefined) {
		result = TranscriptionResult.Silence; // placeholder, won't render anyway
	} else {
		const normalizedTranscription = normalizeText(transcription);
		const normalizedExpected = normalizeText(expectedText);
		result =
			normalizedTranscription === normalizedExpected
				? TranscriptionResult.Success
				: TranscriptionResult.Fail;
	}

	const animationClass = isNew ? ANIMATION_CLASS[result] : "";

	// Don't render if no transcription attempt was made
	if (transcription === undefined) return null;

	const iconSize = "h-6 w-6";

	// Silence: show audio icon with suggestions
	if (result === TranscriptionResult.Silence) {
		return (
			<Popover
				trigger={
					<div className={`transition-colors ${animationClass}`}>
						<AudioLines className={`${iconSize} text-blue-400 hover:text-blue-300`} />
					</div>
				}
				defaultOpen={true}
			>
				<div className="space-y-4">
					<p className="text-warm-cream">Could not understand that</p>
					<SuggestionsPanel />
				</div>
			</Popover>
		);
	}

	// Success: show check icon with animation
	if (result === TranscriptionResult.Success) {
		return (
			<div className={`transition-colors ${animationClass}`}>
				<Check className={`${iconSize} text-green-400`} />
			</div>
		);
	}

	// Fail: show X icon with suggestions popover
	return (
		<Popover
			trigger={
				<div className={`transition-colors ${animationClass}`}>
					<X className={`${iconSize} text-red-400 hover:text-red-300`} />
				</div>
			}
			defaultOpen={true}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<div>
						<strong>You said:</strong>
						<p className="text-sm">{transcription}</p>
					</div>
					{!hideExpected && (
						<div>
							<strong>Expected:</strong>
							<p className="text-sm">{expectedText}</p>
						</div>
					)}
				</div>
				<SuggestionsPanel />
			</div>
		</Popover>
	);
};

const iconVariants = cva("", {
	variants: {
		size: {
			small: "h-4 w-4",
			medium: "h-8 w-8",
		},
	},
	defaultVariants: {
		size: "small",
	},
});

export interface ResultTextIndicatorProps {
	inputText: string;
	expectedText: string;
	hint?: string | undefined | null;
	size?: "small" | "medium";
}

export const ResultTextIndicator: FC<ResultTextIndicatorProps> = ({
	inputText,
	expectedText,
	hint,
	size = "medium",
}) => {
	const isCorrect = normalizeText(inputText) === normalizeText(expectedText);

	const result = isCorrect ? (
		<Check className={`${iconVariants({ size })} animate-stamp text-green-400`} />
	) : (
		<X className={`${iconVariants({ size })} animate-shake text-red-400`} />
	);

	if (!hint) return result;

	return (
		<Popover trigger={result} defaultOpen>
			<p className="text-warm-cream">{hint}</p>
		</Popover>
	);
};
