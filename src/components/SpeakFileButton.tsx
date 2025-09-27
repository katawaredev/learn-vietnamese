import { type FC, useCallback } from "react";
import AudioButton from "./AudioButton";

interface SpeakFileButtonProps {
	url: string;
	size?: "small" | "medium" | "large";
}

const SpeakFileButton: FC<SpeakFileButtonProps> = ({
	url,
	size = "medium",
}) => {
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		const audio = new Audio(url);
		return audio;
	}, [url]);

	const canPlay = useCallback(() => {
		return !!url.trim();
	}, [url]);

	return <AudioButton size={size} getAudio={getAudio} canPlay={canPlay} />;
};

export default SpeakFileButton;
