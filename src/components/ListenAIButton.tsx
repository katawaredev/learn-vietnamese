import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSTT } from "~/providers/stt-provider";
import { ListenBaseButton, type RecordingState } from "./ListenBaseButton";
import type { ListenButtonProps } from "./ListenButton";

export const ListenAIButton: FC<ListenButtonProps> = ({
	onTranscription,
	size = "medium",
	className,
}) => {
	const { selectedModel } = useSTT();
	const [state, setState] = useState<RecordingState>("idle");
	const [loadingProgress, setLoadingProgress] = useState<number>(0);

	const worker = useRef<Worker | null>(null);
	const currentModelRef = useRef<string | null>(null);
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const audioChunks = useRef<Blob[]>([]);
	const pendingAudio = useRef<Float32Array | null>(null);
	const onTranscriptionRef = useRef(onTranscription);

	// Keep onTranscription ref up to date
	useEffect(() => {
		onTranscriptionRef.current = onTranscription;
	}, [onTranscription]);

	// Initialize worker
	useEffect(() => {
		worker.current = new Worker(
			new URL("../workers/stt-worker.ts", import.meta.url),
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
				case "ready": {
					// Reset loading progress
					setLoadingProgress(0);
					// If we have pending audio, transcribe it now
					if (pendingAudio.current && worker.current) {
						worker.current.postMessage({
							type: "transcribe",
							audio: pendingAudio.current,
						});
						pendingAudio.current = null;
					} else {
						// No pending audio, go back to idle
						setState("idle");
					}
					break;
				}
				case "complete":
					if (message.text) {
						onTranscriptionRef.current(message.text.trim());
					}
					setState("idle");
					setLoadingProgress(0);
					break;
				case "error":
					console.error("Transcription failed:", message.error);
					setState("idle");
					setLoadingProgress(0);
					pendingAudio.current = null;
					break;
			}
		};

		return () => {
			if (
				mediaRecorder.current &&
				mediaRecorder.current.state === "recording"
			) {
				mediaRecorder.current.stop();
			}
			if (worker.current) {
				worker.current.terminate();
				worker.current = null;
			}
		};
	}, []);

	// Reset model reference when selectedModel changes (don't auto-load)
	useEffect(() => {
		const modelPath =
			selectedModel.provider === "phowhisper"
				? selectedModel.modelPath || ""
				: `Xenova/whisper-${selectedModel.modelSize}`;

		if (currentModelRef.current !== modelPath) {
			currentModelRef.current = null; // Force reload on next use
		}
	}, [selectedModel]);

	// Process audio and transcribe using web worker
	const processAudio = useCallback(
		async (audioBlob: Blob) => {
			if (!worker.current) return;

			setState("processing");

			try {
				// Convert blob to audio buffer
				const arrayBuffer = await audioBlob.arrayBuffer();

				// Create AudioContext to decode audio data
				const audioContext = new AudioContext({ sampleRate: 16000 });
				const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
				const audioData = audioBuffer.getChannelData(0); // Get Float32Array

				// Close the AudioContext to free resources
				await audioContext.close();

				// Initialize model if not already loaded
				const modelPath =
					selectedModel.provider === "phowhisper"
						? selectedModel.modelPath || ""
						: `Xenova/whisper-${selectedModel.modelSize}`;

				if (currentModelRef.current !== modelPath && modelPath) {
					// Store audio for transcription after model loads
					pendingAudio.current = audioData;
					currentModelRef.current = modelPath;
					worker.current.postMessage({
						type: "init",
						modelPath,
					});
				} else {
					// Model already loaded, transcribe immediately
					worker.current.postMessage({
						type: "transcribe",
						audio: audioData,
					});
				}
			} catch (error) {
				console.error("Audio processing failed:", error);
				setState("idle");
			}
		},
		[selectedModel],
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
			className={className}
			onStartRecording={handleStartRecording}
			onStopRecording={handleStopRecording}
			loadingProgress={loadingProgress}
		/>
	);
};
