import type { FC } from "react";
import { lazy, Suspense } from "react";
import { useSTT } from "~/providers/stt-provider";
import type { Language } from "~/providers/tts-provider";
import { ListenButtonLoading } from "./ListenBaseButton";

const ListenAIButton = lazy(() =>
	import("./ListenAIButton").then((m) => ({ default: m.ListenAIButton })),
);
const ListenWebButton = lazy(() =>
	import("./ListenWebButton").then((m) => ({ default: m.ListenWebButton })),
);

export interface ListenButtonProps {
	onTranscription: (text: string) => void;
	lang?: Language;
	size?: "small" | "medium" | "large";
	className?: string;
	disabled?: boolean;
}

export const ListenButton: FC<ListenButtonProps> = ({
	lang = "vn",
	...props
}) => {
	const { getSelectedModel } = useSTT();
	const selectedModel = getSelectedModel(lang);

	return (
		<Suspense
			fallback={
				<ListenButtonLoading size={props.size} className={props.className} />
			}
		>
			{selectedModel.provider === "web-speech" ? (
				<ListenWebButton {...props} lang={lang} />
			) : (
				<ListenAIButton {...props} lang={lang} />
			)}
		</Suspense>
	);
};
