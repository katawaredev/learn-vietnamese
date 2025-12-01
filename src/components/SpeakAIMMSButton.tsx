import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useTTS } from "~/providers/tts-provider";
import { ttsMMSPool } from "~/workers/tts-mms-worker-pool";
import { SpeakBaseButton } from "./SpeakBaseButton";
import type { SpeakButtonProps } from "./SpeakButton";

export const SpeakAIMMSButton: FC<SpeakButtonProps> = ({
	text,
	lang = "vn",
	size = "medium",
	className,
}) => {
	const { getSelectedVoice } = useTTS();
	const selectedVoice = getSelectedVoice(lang);
	const [isGenerating, setIsGenerating] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState<number>(0);
	const isMountedRef = useRef(true);

	// Track mount state for cleanup
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Generate audio using worker pool
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		const trimmedText = text.trim();
		const modelId =
			selectedVoice.modelId ||
			(lang === "vn" ? "Xenova/mms-tts-vie" : "Xenova/mms-tts-eng");

		// Check if cached (won't trigger generation)
		if (ttsMMSPool.isCached(trimmedText, modelId)) {
			// Cached audio returns immediately, no loading state needed
			return ttsMMSPool.generateAudio(trimmedText, modelId);
		}

		// Not cached - show loading state
		setIsGenerating(true);
		setLoadingProgress(0);

		try {
			const audio = await ttsMMSPool.generateAudio(
				trimmedText,
				modelId,
				(progress) => {
					if (isMountedRef.current) {
						setLoadingProgress(Math.round(progress));
					}
				},
			);

			if (isMountedRef.current) {
				setIsGenerating(false);
				setLoadingProgress(0);
			}

			return audio;
		} catch (error) {
			if (isMountedRef.current) {
				setIsGenerating(false);
				setLoadingProgress(0);
			}
			throw error;
		}
	}, [text, selectedVoice.modelId, lang]);

	const canPlay = useCallback(() => !!text.trim(), [text]);

	return (
		<SpeakBaseButton
			key={text}
			size={size}
			getAudio={getAudio}
			canPlay={canPlay}
			isGenerating={isGenerating}
			loadingProgress={loadingProgress}
			className={className}
		/>
	);
};
