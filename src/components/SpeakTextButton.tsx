import { predict, type VoiceId } from "@diffusionstudio/vits-web";
import { type FC, useCallback } from "react";
import AudioButton from "./AudioButton";

interface SpeakTextButtonProps {
	text: string;
	voiceId?: VoiceId;
	size?: "small" | "medium" | "large";
}

const SpeakTextButton: FC<SpeakTextButtonProps> = ({
	text,
	voiceId = "vi_VN-vais1000-medium",
	size = "medium",
}) => {
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		// Generate audio with VITS
		const wav = await predict({
			text: text.trim(),
			voiceId: voiceId,
		});

		const audioUrl = URL.createObjectURL(wav);
		const audio = new Audio(audioUrl);
		return audio;
	}, [text, voiceId]);

	const canPlay = useCallback(() => {
		return !!text.trim();
	}, [text]);

	return <AudioButton size={size} getAudio={getAudio} canPlay={canPlay} />;
};

export default SpeakTextButton;
