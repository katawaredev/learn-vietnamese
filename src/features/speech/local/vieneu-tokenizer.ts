import { Schema } from "effect";

const Tokenizer = Schema.Struct({
	model: Schema.Struct({
		type: Schema.Literal("BPE"),
		vocab: Schema.Record(Schema.String, Schema.Int),
		merges: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
	}),
	added_tokens: Schema.Array(
		Schema.Struct({ id: Schema.Int, content: Schema.String, special: Schema.Boolean }),
	),
});
// GPT byte-to-Unicode alphabet used by the pinned upstream tokenizer.
const alphabet = new Map<number, string>();
let extended = 256;
for (let byte = 0; byte < 256; byte++)
	alphabet.set(
		byte,
		String.fromCodePoint(
			(byte >= 33 && byte <= 126) || (byte >= 161 && byte <= 172) || byte >= 174
				? byte
				: extended++,
		),
	);
const PRETOKENS =
	/'(?:s|t|re|ve|m|ll|d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/giu;

export function vieneuTokenizer(value: unknown) {
	const config = Schema.decodeUnknownSync(Tokenizer)(value);
	const ranks = new Map(config.model.merges.map((pair, index) => [JSON.stringify(pair), index]));
	const special = new Map(
		config.added_tokens.filter((token) => token.special).map((token) => [token.content, token.id]),
	);
	return (text: string) => {
		const output: number[] = [];
		for (const span of text.normalize("NFC").split(/(<\|[^|]+\|>)/g)) {
			const id = special.get(span);
			if (id !== undefined) {
				output.push(id);
				continue;
			}
			for (const token of span.match(PRETOKENS) ?? []) {
				let symbols = Array.from(new TextEncoder().encode(token), (byte) => alphabet.get(byte)!);
				while (symbols.length > 1) {
					let best = Infinity;
					let pair: string | undefined;
					for (let i = 0; i + 1 < symbols.length; i++) {
						const key = JSON.stringify([symbols[i], symbols[i + 1]]);
						const rank = ranks.get(key) ?? Infinity;
						if (rank < best) {
							best = rank;
							pair = key;
						}
					}
					if (!pair) break;
					const merged: string[] = [];
					for (let i = 0; i < symbols.length; i++) {
						if (i + 1 < symbols.length && JSON.stringify([symbols[i], symbols[i + 1]]) === pair)
							merged.push(symbols[i] + symbols[++i]);
						else merged.push(symbols[i]);
					}
					symbols = merged;
				}
				output.push(
					...symbols.map((symbol) => config.model.vocab[symbol] ?? config.model.vocab["<|unk|>"]),
				);
			}
		}
		return output;
	};
}
