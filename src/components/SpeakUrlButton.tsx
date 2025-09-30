import { type FC, useCallback } from "react";
import { SpeakBaseButton } from "./SpeakBaseButton";

interface SpeakUrlButtonProps {
	url: string;
	size?: "small" | "medium" | "large";
}

export const SpeakUrlButton: FC<SpeakUrlButtonProps> = ({
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

	return (
		<SpeakBaseButton
			key={url}
			size={size}
			getAudio={getAudio}
			canPlay={canPlay}
		/>
	);
};
