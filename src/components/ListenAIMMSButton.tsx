import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSTT } from "~/providers/stt-provider";
import { isSilent } from "~/utils/audio";
import { sttPool } from "~/workers/stt-worker-pool";
import { ListenBaseButton, type RecordingState } from "./ListenBaseButton";
import type { ListenButtonProps } from "./ListenButton";

export const ListenAIMMSButton: FC<ListenButtonProps> = ({
	onTranscription,
	lang = "vn",
	size = "medium",
	className,
	disabled = false,
}) => {
	const { getSelectedModel } = useSTT();
	const selectedModel = getSelectedModel(lang);
	const [state, setState] = useState<RecordingState>("idle");
	const [loadingProgress, setLoadingProgress] = useState<number>(0);

	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const audioChunks = useRef<Blob[]>([]);
	const onTranscriptionRef = useRef(onTranscription);
	const isMountedRef = useRef(true);

	// Keep onTranscription ref up to date
	useEffect(() => {
		onTranscriptionRef.current = onTranscription;
	}, [onTranscription]);

	// Track mount state for cleanup
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			// Stop recording if component unmounts while recording
			if (
				mediaRecorder.current &&
				mediaRecorder.current.state === "recording"
			) {
				mediaRecorder.current.stop();
			}
		};
	}, []);

	// Process audio and transcribe using worker pool
	const processAudio = useCallback(
		async (audioBlob: Blob) => {
			if (!isMountedRef.current) return;

			setState("processing");
			setLoadingProgress(0);

			try {
				// Convert blob to audio buffer
				const arrayBuffer = await audioBlob.arrayBuffer();

				// Decode audio — use callback form for broader Safari compatibility.
				// Always close in finally to avoid leaking AudioContext instances
				// (Safari enforces a hard limit of 4 concurrent contexts).
				const audioContext = new AudioContext({ sampleRate: 16000 });
				let audioData: Float32Array;
				try {
					const audioBuffer = await new Promise<AudioBuffer>(
						(resolve, reject) =>
							audioContext.decodeAudioData(arrayBuffer, resolve, reject),
					);
					audioData = audioBuffer.getChannelData(0);
				} finally {
					await audioContext.close().catch(() => {});
				}

				// Skip transcription if audio is silent or too short
				if (isSilent(audioData)) {
					if (isMountedRef.current) {
						setState("idle");
						setLoadingProgress(0);
					}
					return;
				}

				// Get model path
				const modelPath =
					selectedModel.provider === "phowhisper"
						? selectedModel.modelPath || ""
						: `Xenova/whisper-${selectedModel.modelSize}`;

				if (!modelPath) {
					throw new Error("No model path available");
				}

				// Transcribe using worker pool
				const text = await sttPool.transcribe(
					audioData,
					modelPath,
					lang,
					(progress) => {
						if (isMountedRef.current) {
							setLoadingProgress(Math.round(progress));
						}
					},
				);

				if (isMountedRef.current) {
					if (text.trim()) {
						onTranscriptionRef.current(text.trim());
					}
					setState("idle");
					setLoadingProgress(0);
				}
			} catch (error) {
				console.error("Audio processing failed:", error);
				if (isMountedRef.current) {
					setState("idle");
					setLoadingProgress(0);
				}
			}
		},
		[selectedModel, lang],
	);

	// Start recording
	const handleStartRecording = useCallback(async () => {
		if (state !== "idle") return;

		try {
			// navigator.mediaDevices requires a secure context (HTTPS or localhost).
			// Mobile Safari enforces this strictly — it's undefined over plain HTTP.
			if (!navigator.mediaDevices?.getUserMedia) {
				throw new Error(
					window.isSecureContext === false
						? "Microphone access requires HTTPS. Please use a secure connection."
						: "Microphone access is not supported in this browser.",
				);
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Pick a MIME type the current browser actually supports.
			// Safari records audio/mp4; Chrome/Firefox prefer audio/webm.
			const mimeType =
				["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
					MediaRecorder.isTypeSupported(type),
				) ?? "";

			mediaRecorder.current = new MediaRecorder(
				stream,
				mimeType ? { mimeType } : undefined,
			);
			// Capture the type the recorder actually chose (may differ from mimeType hint)
			const actualMimeType =
				mediaRecorder.current.mimeType || mimeType || "audio/mp4";
			audioChunks.current = [];

			mediaRecorder.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.current.push(event.data);
				}
			};

			mediaRecorder.current.onstop = async () => {
				const audioBlob = new Blob(audioChunks.current, {
					type: actualMimeType,
				});
				stream.getTracks().forEach((track) => {
					track.stop();
				});
				await processAudio(audioBlob);
			};

			mediaRecorder.current.start();
			setState("recording");
		} catch (error) {
			// DOMException properties aren't enumerable — Safari logs them as {}.
			if (error instanceof DOMException) {
				console.error(
					`Failed to start recording: ${error.name}: ${error.message}`,
				);
			} else {
				console.error("Failed to start recording:", error);
			}
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
			disabled={disabled}
		/>
	);
};
