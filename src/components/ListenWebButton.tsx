import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ListenBaseButton, type RecordingState } from "./ListenBaseButton";
import type { ListenButtonProps } from "./ListenButton";

export const ListenWebButton: FC<ListenButtonProps> = ({
	onTranscription,
	lang = "vn",
	size = "medium",
	className,
	disabled = false,
}) => {
	const [state, setState] = useState<RecordingState>("idle");
	const recognition = useRef<SpeechRecognition | null>(null);

	// Cleanup effect
	useEffect(() => {
		return () => {
			if (recognition.current) {
				recognition.current.stop();
				recognition.current = null;
			}
		};
	}, []);

	// Start recording - create a fresh instance each time (required for Safari)
	const handleStartRecording = useCallback(() => {
		if (state !== "idle") return;
		if (typeof window === "undefined") return;

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) return;

		const speechRecognition = new SpeechRecognition();
		speechRecognition.continuous = false;
		speechRecognition.interimResults = false;
		speechRecognition.lang = lang === "vn" ? "vi-VN" : "en-US";

		speechRecognition.onstart = () => setState("recording");

		speechRecognition.onresult = (event) => {
			if (event.results.length > 0) {
				onTranscription(event.results[0][0].transcript.trim());
			}
			setState("idle");
		};

		speechRecognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setState("idle");
		};

		speechRecognition.onend = () => setState("idle");

		recognition.current = speechRecognition;
		recognition.current.start();
	}, [state, lang, onTranscription]);

	// Stop recording
	const handleStopRecording = useCallback(() => {
		if (recognition.current) {
			recognition.current.stop();
		}
	}, []);

	// Check if Web Speech API is available
	const isAvailable =
		typeof window !== "undefined" &&
		(window.SpeechRecognition || window.webkitSpeechRecognition);

	return (
		<ListenBaseButton
			state={state}
			size={size}
			className={className}
			onStartRecording={handleStartRecording}
			onStopRecording={handleStopRecording}
			disabled={disabled || !isAvailable}
		/>
	);
};
