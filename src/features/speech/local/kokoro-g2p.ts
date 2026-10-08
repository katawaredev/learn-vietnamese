// vig2p 0.1.2's vocabulary adaptation on top of sea-g2p.
const FIXUPS = [
	["tʃ", "ʧ"],
	["t̪", "t"],
	["e-", "æ"],
	["1", "→"],
	["7", "→"],
	["2", "↘"],
	["ɜ", "↗"],
	["3", "↗"],
	["4", "↓"],
	["5", "ʔ↗"],
	["6", "ʔ↓"],
	["ɗ", "d"],
	["ʐ", "ʒ"],
	["̪", ""],
	["-", ""],
	["–", "—"],
	["*", ""],
	["/", " "],
	["&", " "],
	["'", ""],
	["’", ""],
	["‘", ""],
	["đ", "d"],
	["̩", ""],
] as const;
export function fixKokoroPhonemes(phonemes: string, source = "") {
	for (const [from, to] of FIXUPS) phonemes = phonemes.replaceAll(from, to);
	const word = source.toLowerCase();
	if (word.startsWith("th")) phonemes = phonemes.replace("t", "θ");
	else if (word.startsWith("tr")) phonemes = phonemes.replace("ʧ", "ʈʂ");
	else if (word.startsWith("s") && !/^(sc|sh|sk|sl|sm|sn|sp|st|sw)/.test(word))
		phonemes = phonemes.replace("s", "ʂ");
	else if (/^g[iìíỉĩị]/.test(word)) phonemes = phonemes.replace("z", "ʝ");
	return phonemes;
}
export function kokoroPhonemes(text: string, phonemize: (word: string) => string) {
	return (
		text
			.replaceAll("’", "'")
			.replaceAll("‘", "'")
			.match(/[A-Za-zÀ-ỹĐđ]+(?:[-'][A-Za-zÀ-ỹĐđ]+)*|\s+|./gu) ?? []
	)
		.map((token) =>
			/^\s+$/.test(token)
				? " "
				: /^[A-Za-zÀ-ỹĐđ]+(?:[-'][A-Za-zÀ-ỹĐđ]+)*$/u.test(token)
					? fixKokoroPhonemes(phonemize(token), token)
					: fixKokoroPhonemes(token),
		)
		.join("")
		.trim();
}
