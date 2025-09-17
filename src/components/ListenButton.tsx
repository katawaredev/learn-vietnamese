import { MicrophoneIcon } from "@heroicons/react/24/outline";
import {
	type AutomaticSpeechRecognitionOutput,
	type AutomaticSpeechRecognitionPipeline,
	pipeline,
} from "@huggingface/transformers";
import { cva } from "class-variance-authority";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Type definitions for our domain model
type RecordingState = "idle" | "recording" | "processing";

const buttonVariants = cva(
	"relative rounded-full border-0 flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
	{
		variants: {
			size: {
				small: "w-12 h-12",
				medium: "w-16 h-16",
				large: "w-20 h-20",
			},
			state: {
				idle: "bg-red-500 hover:bg-red-600 shadow-red-500/25",
				recording: "bg-red-600 shadow-red-500/50",
				processing: "bg-red-500 cursor-wait",
			},
		},
		defaultVariants: {
			size: "medium",
			state: "idle",
		},
	},
);

interface SpeechToTextButtonProps {
	onTranscription: (text: string) => void;
	size?: "small" | "medium" | "large";
	modelSize?: "tiny" | "small" | "medium" | "large";
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
	onTranscription,
	size = "medium",
	modelSize = "tiny",
}) => {
	const [state, setState] = useState<RecordingState>("idle");
	const [isHolding, setIsHolding] = useState(false);

	const transcriber = useRef<AutomaticSpeechRecognitionPipeline | null>(null);
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const audioChunks = useRef<Blob[]>([]);
	const holdTimeout = useRef<NodeJS.Timeout | null>(null);

	// Cleanup effect
	useEffect(() => {
		return () => {
			// Cleanup
			if (
				mediaRecorder.current &&
				mediaRecorder.current.state === "recording"
			) {
				mediaRecorder.current.stop();
			}
		};
	}, []);

	// Process audio and transcribe
	const processAudio = useCallback(
		async (audioBlob: Blob) => {
			setState("processing");

			try {
				// Initialize model if not already done
				if (!transcriber.current) {
					const model = await pipeline(
						"automatic-speech-recognition",
						`Xenova/whisper-${modelSize}`,
					);
					transcriber.current = model as AutomaticSpeechRecognitionPipeline;
				}

				// Convert blob to audio buffer
				const arrayBuffer = await audioBlob.arrayBuffer();

				// Create AudioContext to decode audio data
				const audioContext = new AudioContext({ sampleRate: 16000 });
				const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
				const audioData = audioBuffer.getChannelData(0); // Get Float32Array

				// Close the AudioContext to free resources
				await audioContext.close();

				// Transcribe using Whisper with Float32Array
				const result = (await transcriber.current(audioData, {
					language: "vietnamese",
					task: "transcribe",
				})) as AutomaticSpeechRecognitionOutput;

				if (result?.text) {
					onTranscription(result.text.trim());
				}
			} catch (error) {
				console.error("Transcription failed:", error);
			} finally {
				setState("idle");
			}
		},
		[onTranscription, modelSize],
	);

	// Start recording
	const startRecording = useCallback(async () => {
		if (state !== "idle") return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream);
			audioChunks.current = [];

			mediaRecorder.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.current.push(event.data);
				}
			};

			mediaRecorder.current.onstop = async () => {
				const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
				stream.getTracks().forEach((track) => {
					track.stop();
				});
				await processAudio(audioBlob);
			};

			mediaRecorder.current.start();
			setState("recording");
		} catch (error) {
			console.error("Failed to start recording:", error);
			setState("idle");
		}
	}, [state, processAudio]);

	// Stop recording
	const stopRecording = useCallback(() => {
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
			setState("processing");
		}
	}, []);

	// Handle click (toggle recording)
	const handleClick = useCallback(() => {
		// If we're in hold mode, don't process click
		if (isHolding) return;

		if (state === "recording") {
			stopRecording();
		} else if (state === "idle") {
			startRecording();
		}
	}, [state, isHolding, startRecording, stopRecording]);

	// Handle mouse/touch down (start hold)
	const handlePressStart = useCallback(() => {
		if (state !== "idle") return;

		// Set a timeout to detect hold vs click
		holdTimeout.current = setTimeout(() => {
			setIsHolding(true);
			startRecording();
		}, 200); // 200ms threshold for hold detection
	}, [state, startRecording]);

	// Handle mouse/touch up (end hold)
	const handlePressEnd = useCallback(() => {
		if (holdTimeout.current) {
			clearTimeout(holdTimeout.current);
			holdTimeout.current = null;
		}

		if (isHolding && state === "recording") {
			stopRecording();
			setIsHolding(false);
		}
	}, [isHolding, state, stopRecording]);

	return (
		<button
			type="button"
			className={buttonVariants({ size, state })}
			onClick={handleClick}
			onMouseDown={handlePressStart}
			onMouseUp={handlePressEnd}
			onMouseLeave={handlePressEnd}
			onTouchStart={handlePressStart}
			onTouchEnd={handlePressEnd}
			disabled={state === "processing"}
			aria-label={state === "recording" ? "Stop recording" : "Start recording"}
		>
			{/* Microphone Icon */}
			<MicrophoneIcon
				className={`${
					size === "small"
						? "h-4 w-4"
						: size === "medium"
							? "h-6 w-6"
							: "h-8 w-8"
				} text-white`}
			/>

			{/* Processing indicator */}
			{state === "processing" && (
				<div className="absolute inset-1 animate-spin rounded-full border-2 border-white/30 border-t-white" />
			)}

			{/* Recording indicator */}
			{state === "recording" && (
				<div className="-inset-1 absolute animate-ping rounded-full border-2 border-red-500/60" />
			)}
		</button>
	);
};

export default SpeechToTextButton;
