import { type FC, useCallback } from "react";
import { SpeakBaseButton } from "./SpeakBaseButton";
import type { SpeakButtonProps } from "./SpeakButton";

interface SpeakUrlButtonProps extends Omit<SpeakButtonProps, "text"> {
	url: string;
}

export const SpeakUrlButton: FC<SpeakUrlButtonProps> = ({
	url,
	size = "medium",
	className,
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
			className={className}
		/>
	);
};
