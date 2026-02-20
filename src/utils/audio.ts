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
 *
 * NOTE: Trimming trailing silence before sending to Whisper has no effect on inference
 * cost. Whisper's encoder always processes a fixed 30-second mel spectrogram (3000
 * time positions) regardless of actual audio length — shorter audio is zero-padded to
 * fill the window. Trimming 3s of silence from a 10s recording still produces the same
 * 30s encoder input. Pre-trimming would only help with chunked inference (chunk_length_s),
 * which itself only pays off for recordings longer than ~30s.
 * Ref: https://gattanasio.cc/post/whisper-encoder/
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
