import { predict } from "@diffusionstudio/vits-web";
import { type FC, useCallback } from "react";
import { useTTS } from "~/providers/tts-provider";
import { SpeakBaseButton } from "./SpeakBaseButton";

interface SpeakAIButtonProps {
	text: string;
	size?: "small" | "medium" | "large";
}

export const SpeakAIButton: FC<SpeakAIButtonProps> = ({
	text,
	size = "medium",
}) => {
	const { selectedVoice } = useTTS();

	// Generate audio
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		const trimmedText = text.trim();

		// Generate audio with VITS
		const wav = await predict({
			text: trimmedText,
			voiceId: selectedVoice.voiceId || "vi_VN-vais1000-medium",
		});

		const audioUrl = URL.createObjectURL(wav);
		const audio = new Audio(audioUrl);
		return audio;
	}, [text, selectedVoice.voiceId]);

	const canPlay = useCallback(() => !!text.trim(), [text]);

	return <SpeakBaseButton size={size} getAudio={getAudio} canPlay={canPlay} />;
};
