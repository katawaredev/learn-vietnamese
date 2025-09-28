import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ListenBaseButton, type RecordingState } from "./ListenBaseButton";

interface ListenWebButtonProps {
	onTranscription: (text: string) => void;
	size?: "small" | "medium" | "large";
}

export const ListenWebButton: React.FC<ListenWebButtonProps> = ({
	onTranscription,
	size = "medium",
}) => {
	const [state, setState] = useState<RecordingState>("idle");
	const recognition = useRef<SpeechRecognition | null>(null);

	// Initialize Web Speech API recognition
	const initWebSpeechAPI = useCallback(() => {
		if (typeof window === "undefined") return;

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) return;

		const speechRecognition = new SpeechRecognition();
		speechRecognition.continuous = false;
		speechRecognition.interimResults = false;
		speechRecognition.lang = "vi-VN";

		speechRecognition.onstart = () => {
			setState("recording");
		};

		speechRecognition.onresult = (event) => {
			if (event.results.length > 0) {
				const transcript = event.results[0][0].transcript;
				onTranscription(transcript.trim());
			}
			setState("idle");
		};

		speechRecognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setState("idle");
		};

		speechRecognition.onend = () => {
			setState("idle");
		};

		recognition.current = speechRecognition;
	}, [onTranscription]);

	// Initialize recognition on component mount
	useEffect(() => {
		initWebSpeechAPI();
	}, [initWebSpeechAPI]);

	// Cleanup effect
	useEffect(() => {
		return () => {
			if (recognition.current) {
				recognition.current.stop();
			}
		};
	}, []);

	// Start recording
	const handleStartRecording = useCallback(() => {
		if (state !== "idle") return;

		if (recognition.current) {
			recognition.current.start();
		}
	}, [state]);

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
			onStartRecording={handleStartRecording}
			onStopRecording={handleStopRecording}
			disabled={!isAvailable}
		/>
	);
};
