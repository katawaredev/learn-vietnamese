import { Schema } from "effect";

export const Language = Schema.Literals(["vn", "en"]);
export type Language = typeof Language.Type;
export const SpeechBackend = Schema.Literals(["server", "browser", "local"]);
export type SpeechBackend = typeof SpeechBackend.Type;

export const SynthesisRequest = Schema.Struct({
	text: Schema.Trimmed.check(Schema.isMinLength(1), Schema.isMaxLength(4096)),
	language: Language,
});
export type SynthesisRequest = typeof SynthesisRequest.Type;

export const Transcript = Schema.Struct({ text: Schema.String });
export const Capabilities = Schema.Struct({
	tts: Schema.Struct({ vn: Schema.Boolean, en: Schema.Boolean }),
	stt: Schema.Boolean,
	chat: Schema.Boolean,
});
export type Capabilities = typeof Capabilities.Type;

export const SpeechPreferences = Schema.Struct({
	tts: Schema.Struct({ vn: SpeechBackend, en: SpeechBackend }),
	stt: Schema.Struct({ vn: SpeechBackend, en: SpeechBackend }),
});
export type SpeechPreferences = typeof SpeechPreferences.Type;

export const EMPTY_CAPABILITIES: Capabilities = {
	tts: { vn: false, en: false },
	stt: false,
	chat: false,
};
export const MAX_RECORDING_MS = 60_000;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
