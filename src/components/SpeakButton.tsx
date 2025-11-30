import type { FC } from "react";
import { lazy, Suspense } from "react";
import { type Language, useTTS } from "~/providers/tts-provider";
import { SpeakButtonLoading } from "./SpeakBaseButton";

const SpeakAIButton = lazy(() =>
	import("./SpeakAIButton").then((m) => ({ default: m.SpeakAIButton })),
);
const SpeakWebButton = lazy(() =>
	import("./SpeakWebButton").then((m) => ({ default: m.SpeakWebButton })),
);

export interface SpeakButtonProps {
	text: string;
	lang?: Language;
	size?: "small" | "medium" | "large";
	className?: string;
}

export const SpeakButton: FC<SpeakButtonProps> = ({
	text,
	lang = "vn",
	size = "medium",
	className,
}) => {
	const { getSelectedVoice } = useTTS();
	const selectedVoice = getSelectedVoice(lang);

	return (
		<Suspense
			fallback={<SpeakButtonLoading size={size} className={className} />}
		>
			{selectedVoice.provider === "web-speech" ? (
				<SpeakWebButton
					text={text}
					lang={lang}
					voice={selectedVoice.webSpeechVoice}
					size={size}
					className={className}
				/>
			) : (
				<SpeakAIButton
					text={text}
					lang={lang}
					size={size}
					className={className}
				/>
			)}
		</Suspense>
	);
};
