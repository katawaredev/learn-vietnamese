import type { FC } from "react";
import { useSTT } from "~/providers/stt-provider";
import type { Language } from "~/providers/tts-provider";
import { ListenAIButton } from "./ListenAIButton";
import { ListenWebButton } from "./ListenWebButton";

export interface ListenButtonProps {
	onTranscription: (text: string) => void;
	lang?: Language;
	size?: "small" | "medium" | "large";
	className?: string;
}

export const ListenButton: FC<ListenButtonProps> = ({
	lang = "vn",
	...props
}) => {
	const { getSelectedModel } = useSTT();
	const selectedModel = getSelectedModel(lang);

	if (selectedModel.provider === "web-speech") {
		return <ListenWebButton {...props} lang={lang} />;
	}

	return <ListenAIButton {...props} lang={lang} />;
};
