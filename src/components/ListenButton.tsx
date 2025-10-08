import type { FC } from "react";
import { useSTT } from "~/providers/stt-provider";
import { ListenAIButton } from "./ListenAIButton";
import { ListenWebButton } from "./ListenWebButton";

export interface ListenButtonProps {
	onTranscription: (text: string) => void;
	size?: "small" | "medium" | "large";
	className?: string;
}

export const ListenButton: FC<ListenButtonProps> = (props) => {
	const { selectedModel } = useSTT();

	if (selectedModel.provider === "web-speech") {
		return <ListenWebButton {...props} />;
	}

	return <ListenAIButton {...props} />;
};
