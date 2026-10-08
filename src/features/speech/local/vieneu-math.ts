export function project(vector: Float32Array, matrix: Float32Array, rows: number, offset = 0) {
	const output = new Float32Array(rows);
	for (let row = 0; row < rows; row++) {
		let sum = 0;
		const start = offset + row * vector.length;
		for (let column = 0; column < vector.length; column++)
			sum += vector[column] * matrix[start + column];
		output[row] = sum;
	}
	return output;
}
export function argmax(values: Float32Array) {
	let best = 0;
	for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
	return best;
}
export function sample(logits: Float32Array, previous: readonly number[], random = Math.random) {
	for (const id of new Set(previous))
		logits[id] = logits[id] < 0 ? logits[id] * 1.2 : logits[id] / 1.2;
	const candidates = Array.from(logits, (value, id) => ({ id, score: value / 0.8 }))
		.sort((a, b) => b.score - a.score)
		.slice(0, 25);
	const weights = candidates.map((candidate) => Math.exp(candidate.score - candidates[0].score));
	const total = weights.reduce((a, b) => a + b, 0);
	let cumulative = 0;
	let count = 0;
	while (count < weights.length && cumulative / total < 0.95) cumulative += weights[count++];
	let draw = random() * cumulative;
	for (let i = 0; i < count; i++) {
		draw -= weights[i];
		if (draw < 0) return candidates[i].id;
	}
	return candidates[count - 1].id;
}

// Upstream frame cap prevents short lesson words from continuing into invented speech.
export function maxFrames(phonemes: string) {
	const plain = phonemes.replace(/<\|emotion_\d+\|>|<\/?en>/g, "");
	let syllables = 0;
	for (const token of plain.split(/\s+/)) {
		let groups = 0,
			vowel = false,
			consonant = true;
		for (const character of token) {
			if ("aeiouyæɐɑɒɔəɘɛɜɤɯɵøœʉʊʌɪɨɚɝᵻᵿ".includes(character)) {
				if (!vowel && consonant) groups++;
				vowel = true;
				consonant = false;
			} else if ("ːˈˌ".includes(character) || /\d/.test(character)) {
				if ("ˈˌ".includes(character) && groups > 0) {
					vowel = false;
					consonant = true;
				} else vowel = false;
			} else {
				vowel = false;
				consonant = true;
			}
		}
		if (/\p{L}/u.test(token)) syllables += Math.max(1, groups);
	}
	let cap = Math.min(300, 24 + Math.ceil(2 * Array.from(plain).length));
	syllables = Math.max(1, syllables);
	if (
		!phonemes.includes("<|emotion_") &&
		syllables <= 4 &&
		Array.from(plain).length <= 24 * syllables
	)
		cap = Math.min(cap, 13 + 5 * (syllables - 1));
	return cap;
}
