import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { numberToText } from "~/utils/numeric";
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

		let resultReceived = false;

		speechRecognition.onstart = () => setState("recording");

		speechRecognition.onresult = (event) => {
			resultReceived = true;
			if (event.results.length > 0) {
				let transcript = event.results[0][0].transcript.trim();

				// If transcription is a number and language is Vietnamese, convert to Vietnamese text
				if (lang === "vn") {
					const num = Number(transcript);
					if (Number.isInteger(num)) {
						try {
							transcript = numberToText(num);
						} catch {
							// If conversion fails (out of range), use original
						}
					}
				}

				onTranscription(transcript);
			}
			setState("idle");
		};

		speechRecognition.onerror = (event) => {
			resultReceived = true;
			if (event.error === "no-speech") onTranscription(null);
			else console.error("Speech recognition error:", event.error);
			setState("idle");
		};

		speechRecognition.onend = () => {
			if (!resultReceived) {
				onTranscription(null);
			}
			setState("idle");
		};

		recognition.current = speechRecognition;
		recognition.current.start();
	}, [state, lang, onTranscription]);

	// Stop recording - switch to processing state and let recognition finish naturally
	const handleStopRecording = useCallback(() => {
		setState("processing");
		// Don't call stop() - let the Web Speech API finish on its own
		// This prevents interrupting results processing
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
