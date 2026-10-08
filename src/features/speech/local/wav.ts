// PCM16 WAV is supported consistently by HTML audio players across browsers.
export function pcmToWav(pcm: Float32Array, sampleRate: number) {
	const buffer = new ArrayBuffer(44 + pcm.length * 2);
	const view = new DataView(buffer);
	const text = (offset: number, value: string) => {
		for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
	};
	text(0, "RIFF");
	view.setUint32(4, buffer.byteLength - 8, true);
	text(8, "WAVEfmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	text(36, "data");
	view.setUint32(40, pcm.length * 2, true);
	for (let i = 0; i < pcm.length; i++) {
		const sample = Math.max(-1, Math.min(1, pcm[i]));
		view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
	}
	return new Blob([buffer], { type: "audio/wav" });
}
