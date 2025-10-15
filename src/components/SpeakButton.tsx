import type { FC } from "react";
import { useTTS } from "~/providers/tts-provider";
import { SpeakAIButton } from "./SpeakAIButton";
import { SpeakWebButton } from "./SpeakWebButton";

export interface SpeakButtonProps {
	text: string;
	size?: "small" | "medium" | "large";
	className?: string;
}

export const SpeakButton: FC<SpeakButtonProps> = ({
	text,
	size = "medium",
	className,
}) => {
	const { selectedVoice } = useTTS();

	if (selectedVoice.provider === "web-speech") {
		return (
			<SpeakWebButton
				text={text}
				voice={selectedVoice.webSpeechVoice}
				size={size}
				className={className}
			/>
		);
	}

	return <SpeakAIButton text={text} size={size} className={className} />;
};
