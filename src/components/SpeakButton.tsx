import type { FC } from "react";
import { type Language, useTTS } from "~/providers/tts-provider";
import { SpeakAIButton } from "./SpeakAIButton";
import { SpeakWebButton } from "./SpeakWebButton";

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

	if (selectedVoice.provider === "web-speech") {
		return (
			<SpeakWebButton
				text={text}
				lang={lang}
				voice={selectedVoice.webSpeechVoice}
				size={size}
				className={className}
			/>
		);
	}

	return (
		<SpeakAIButton text={text} lang={lang} size={size} className={className} />
	);
};
