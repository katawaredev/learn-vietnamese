import {
	type AutomaticSpeechRecognitionOutput,
	type AutomaticSpeechRecognitionPipeline,
	pipeline,
} from "@huggingface/transformers";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSTT } from "~/providers/stt-provider";
import { ListenBaseButton, type RecordingState } from "./ListenBaseButton";

interface ListenAIButtonProps {
	onTranscription: (text: string) => void;
	size?: "small" | "medium" | "large";
}

export const ListenAIButton: React.FC<ListenAIButtonProps> = ({
	onTranscription,
	size = "medium",
}) => {
	const { selectedModel } = useSTT();
	const [state, setState] = useState<RecordingState>("idle");

	const transcriber = useRef<AutomaticSpeechRecognitionPipeline | null>(null);
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const audioChunks = useRef<Blob[]>([]);

	// Cleanup effect
	useEffect(() => {
		return () => {
			if (
				mediaRecorder.current &&
				mediaRecorder.current.state === "recording"
			) {
				mediaRecorder.current.stop();
			}
		};
	}, []);

	// Process audio and transcribe with Whisper
	const processAudio = useCallback(
		async (audioBlob: Blob) => {
			setState("processing");

			try {
				// Initialize model if not already done
				if (!transcriber.current) {
					const model = await pipeline(
						"automatic-speech-recognition",
						`Xenova/whisper-${selectedModel.modelSize}`,
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
		[onTranscription, selectedModel.modelSize],
	);

	// Start recording
	const handleStartRecording = useCallback(async () => {
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
	const handleStopRecording = useCallback(() => {
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
			setState("processing");
		}
	}, []);

	return (
		<ListenBaseButton
			state={state}
			size={size}
			onStartRecording={handleStartRecording}
			onStopRecording={handleStopRecording}
		/>
	);
};
