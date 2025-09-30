import type { VoiceId } from "@diffusionstudio/vits-web";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useTTS } from "~/providers/tts-provider";
import { SpeakBaseButton } from "./SpeakBaseButton";

interface SpeakAIButtonProps {
	text: string;
	size?: "small" | "medium" | "large";
}

export const SpeakAIButton: FC<SpeakAIButtonProps> = ({
	text,
	size = "medium",
}) => {
	const { selectedVoice } = useTTS();
	const [isGenerating, setIsGenerating] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState<number>(0);
	const worker = useRef<Worker | null>(null);
	const audioCache = useRef<HTMLAudioElement | null>(null);
	const resolveAudio = useRef<((audio: HTMLAudioElement) => void) | null>(null);
	const rejectAudio = useRef<((error: Error) => void) | null>(null);

	// Initialize worker
	useEffect(() => {
		worker.current = new Worker(
			new URL("../workers/tts-worker.ts", import.meta.url),
			{ type: "module" },
		);

		// Handle worker messages
		worker.current.onmessage = (event) => {
			const message = event.data;

			switch (message.status) {
				case "progress": {
					// Update loading progress (0-100)
					const progress = message.progress || 0;
					setLoadingProgress(Math.round(progress));
					break;
				}
				case "complete": {
					const audioUrl = URL.createObjectURL(message.audio);
					const audio = new Audio(audioUrl);
					audioCache.current = audio;
					setIsGenerating(false);
					setLoadingProgress(0);

					if (resolveAudio.current) {
						resolveAudio.current(audio);
						resolveAudio.current = null;
					}
					break;
				}
				case "error":
					console.error("TTS generation failed:", message.error);
					setIsGenerating(false);
					setLoadingProgress(0);
					if (rejectAudio.current) {
						rejectAudio.current(new Error(message.error));
						rejectAudio.current = null;
					}
					break;
			}
		};

		return () => {
			worker.current?.terminate();
			// Clean up cached audio on unmount
			if (audioCache.current) {
				URL.revokeObjectURL(audioCache.current.src);
			}
		};
	}, []);

	// Generate audio using web worker
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		// Return cached audio if available
		if (audioCache.current) {
			return audioCache.current;
		}

		if (!worker.current) {
			throw new Error("Worker not initialized");
		}

		const trimmedText = text.trim();
		setIsGenerating(true);

		// Create a promise that will be resolved by the worker message handler
		return new Promise<HTMLAudioElement>((resolve, reject) => {
			resolveAudio.current = resolve;
			rejectAudio.current = reject;

			const voiceId: VoiceId =
				(selectedVoice.voiceId as VoiceId) || "vi_VN-vais1000-medium";

			worker.current?.postMessage({
				type: "predict",
				text: trimmedText,
				voiceId,
			});
		});
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
		/>
	);
};
