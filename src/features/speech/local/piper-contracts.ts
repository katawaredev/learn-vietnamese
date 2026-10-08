import { Schema } from "effect";

export const PiperConfig = Schema.Struct({
	audio: Schema.Struct({
		sample_rate: Schema.Int.check(Schema.isBetween({ minimum: 8000, maximum: 48000 })),
	}),
	espeak: Schema.Struct({ voice: Schema.String }),
	inference: Schema.Struct({
		noise_scale: Schema.Number,
		length_scale: Schema.Number,
		noise_w: Schema.Number,
	}),
	phoneme_map: Schema.Record(Schema.String, Schema.Array(Schema.String)),
	phoneme_id_map: Schema.Record(
		Schema.String,
		Schema.Array(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
	),
	num_symbols: Schema.Int.check(Schema.isGreaterThan(0)),
	num_speakers: Schema.Int.check(Schema.isGreaterThan(0)),
});
export type PiperConfig = typeof PiperConfig.Type;
export const PhonemizerOutput = Schema.Struct({ phonemes: Schema.Array(Schema.String) });

// Legacy voices have 130 symbols; newer phonemizers also emit tone IDs above that.
// Always apply the model's own mapping, with Piper's BOS/padding/EOS rules.
export function phonemesToIds(phonemes: readonly string[], config: PiperConfig) {
	const map = config.phoneme_id_map;
	if (!map["^"] || !map["_"] || !map["$"]) throw new Error("Incomplete Piper symbol map.");
	const ids = [...map["^"], ...map["_"]];
	for (const phoneme of phonemes) {
		for (const symbol of config.phoneme_map[phoneme] ?? [phoneme]) {
			const mapped = map[symbol];
			if (mapped) ids.push(...mapped, ...map["_"]);
		}
	}
	ids.push(...map["$"]);
	if (ids.some((id) => id >= config.num_symbols)) throw new Error("Invalid Piper symbol map.");
	return ids;
}
