import type { VoiceId } from "@diffusionstudio/vits-web";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useTTS } from "~/providers/tts-provider";
import { ttsVitsPool } from "~/workers/tts-vits-worker-pool";
import { SpeakBaseButton } from "./SpeakBaseButton";
import type { SpeakButtonProps } from "./SpeakButton";

export const SpeakAIVitsButton: FC<SpeakButtonProps> = ({
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

	// Generate audio using VITS worker pool
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		const trimmedText = text.trim();
		const voiceId: VoiceId =
			(selectedVoice.voiceId as VoiceId) || "vi_VN-vais1000-medium";

		// Check if cached (won't trigger generation)
		if (ttsVitsPool.isCached(trimmedText, voiceId)) {
			// Cached audio returns immediately, no loading state needed
			return ttsVitsPool.generateAudio(trimmedText, voiceId);
		}

		// Not cached - show loading state
		setIsGenerating(true);
		setLoadingProgress(0);

		try {
			const audio = await ttsVitsPool.generateAudio(
				trimmedText,
				voiceId,
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
	}, [text, selectedVoice.voiceId]);

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
