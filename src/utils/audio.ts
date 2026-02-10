/**
 * Calculates the Root Mean Square (RMS) of an audio buffer.
 * RMS is a measure of the average power/volume of the signal.
 * Values typically range from 0.0 to 1.0.
 */
export const calculateRMS = (audioData: Float32Array): number => {
	if (audioData.length === 0) return 0;

	let sumSquares = 0;
	for (let i = 0; i < audioData.length; i++) {
		sumSquares += audioData[i] * audioData[i];
	}

	return Math.sqrt(sumSquares / audioData.length);
};

/**
 * Checks if an audio buffer is considered "silent" or too quiet based on a threshold.
 * @param audioData The audio buffer to check
 * @param threshold The RMS threshold below which audio is considered silent (default: 0.05)
 * @param minSamples Minimum number of samples required (default: 1600 - 100ms at 16kHz)
 */
export const isSilent = (
	audioData: Float32Array,
	threshold = 0.05,
	minSamples = 1600,
): boolean => {
	if (audioData.length < minSamples) return true;

	const rms = calculateRMS(audioData);
	return rms < threshold;
};
