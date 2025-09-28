import type { FC } from "react";
import { useTTS } from "~/providers/tts-provider";
import { SpeakAIButton } from "./SpeakAIButton";
import { SpeakWebButton } from "./SpeakWebButton";

interface SpeakButtonProps {
	text: string;
	size?: "small" | "medium" | "large";
}

export const SpeakButton: FC<SpeakButtonProps> = ({
	text,
	size = "medium",
}) => {
	const { selectedVoice } = useTTS();

	if (selectedVoice.provider === "web-speech") {
		return (
			<SpeakWebButton
				text={text}
				voice={selectedVoice.webSpeechVoice}
				size={size}
			/>
		);
	}

	return <SpeakAIButton text={text} size={size} />;
};
