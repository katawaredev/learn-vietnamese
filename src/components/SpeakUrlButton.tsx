import { type FC, useCallback } from "react";
import { SpeakBaseButton } from "./SpeakBaseButton";

interface SpeakFileButtonProps {
	url: string;
	size?: "small" | "medium" | "large";
}

const SpeakFileButton: FC<SpeakFileButtonProps> = ({
	url,
	size = "medium",
}) => {
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		console.log(url);
		const audio = new Audio(url);
		return audio;
	}, [url]);

	const canPlay = useCallback(() => {
		return !!url.trim();
	}, [url]);

	return (
		<SpeakBaseButton
			key={url}
			size={size}
			getAudio={getAudio}
			canPlay={canPlay}
		/>
	);
};

export default SpeakFileButton;
