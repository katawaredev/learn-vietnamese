import type { FC } from "react";
import { useSTT } from "~/providers/stt-provider";
import { ListenAIButton } from "./ListenAIButton";
import { ListenWebButton } from "./ListenWebButton";

interface ListenButtonProps {
	onTranscription: (text: string) => void;
	size?: "small" | "medium" | "large";
}

export const ListenButton: FC<ListenButtonProps> = ({
	onTranscription,
	size = "medium",
}) => {
	const { selectedModel } = useSTT();

	if (selectedModel.provider === "web-speech") {
		return <ListenWebButton onTranscription={onTranscription} size={size} />;
	}

	return <ListenAIButton onTranscription={onTranscription} size={size} />;
};
