import { useCallback, useRef } from "react";
import { calculateRMSFromFrequency } from "~/utils/audio";

interface UseSilenceDetectorOptions {
	onSilenceDetected: () => void;
	silenceThreshold?: number; // RMS threshold below which audio is considered silent
	silenceDuration?: number; // milliseconds of silence before triggering callback
}

/**
 * Hook to detect silence in a live audio stream during recording.
 * Monitors frequency data from an AnalyserNode and triggers a callback when silence is detected.
 */
export function useSilenceDetector({
	onSilenceDetected,
	silenceThreshold = 30,
	silenceDuration = 2000,
}: UseSilenceDetectorOptions) {
	const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const isMountedRef = useRef(true);

	const startSilenceDetection = useCallback(
		(stream: MediaStream) => {
			isMountedRef.current = true;

			try {
				const audioContext = new AudioContext();
				const sourceNode = audioContext.createMediaStreamSource(stream);
				const analyser = audioContext.createAnalyser();
				analyser.fftSize = 2048;
				sourceNode.connect(analyser);
				analyserRef.current = analyser;

				const dataArray = new Uint8Array(analyser.frequencyBinCount);
				let silenceCount = 0;
				const checkInterval = 100; // ms
				const silenceThresholdCount = Math.ceil(
					silenceDuration / checkInterval,
				);

				const checkSilence = () => {
					if (!isMountedRef.current || !analyserRef.current) return;

					analyser.getByteFrequencyData(dataArray);
					const rms = calculateRMSFromFrequency(dataArray);

					if (rms < silenceThreshold) {
						silenceCount++;
						if (silenceCount >= silenceThresholdCount) {
							onSilenceDetected();
							return;
						}
					} else {
						silenceCount = 0;
					}

					silenceTimeoutRef.current = setTimeout(checkSilence, checkInterval);
				};

				silenceTimeoutRef.current = setTimeout(checkSilence, checkInterval);
			} catch (error) {
				console.error("Failed to setup silence detection:", error);
			}
		},
		[onSilenceDetected, silenceThreshold, silenceDuration],
	);

	const stopSilenceDetection = useCallback(() => {
		if (silenceTimeoutRef.current) {
			clearTimeout(silenceTimeoutRef.current);
			silenceTimeoutRef.current = null;
		}
	}, []);

	const cleanup = useCallback(() => {
		isMountedRef.current = false;
		stopSilenceDetection();
	}, [stopSilenceDetection]);

	return { startSilenceDetection, stopSilenceDetection, cleanup };
}
