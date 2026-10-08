import { Schema } from "effect";
import { SpeechPreferences } from "./contracts";
import { findLocalModel, type SpeechKind } from "./local/catalog";

export const BROWSER_VOICE_PREFIX = "browser:";
export const STORAGE_KEY = "speech-settings-v3";
const Models = Schema.Struct({
	tts: Schema.Struct({ vn: Schema.String, en: Schema.String }),
	stt: Schema.Struct({ vn: Schema.String, en: Schema.String }),
});
const Settings = Schema.Struct({ preferences: SpeechPreferences, models: Models });
export type LocalSelections = typeof Models.Type;
export const DEFAULT_LOCAL_MODELS: LocalSelections = {
	tts: { vn: "Xenova/mms-tts-vie", en: "Xenova/mms-tts-eng" },
	stt: { vn: "phowhisper-tiny", en: "whisper-tiny" },
};
export const BROWSER_PREFERENCES: SpeechPreferences = {
	tts: { vn: "browser", en: "browser" },
	stt: { vn: "browser", en: "browser" },
};
export const LOCAL_PREFERENCES: SpeechPreferences = {
	tts: { vn: "local", en: "local" },
	stt: { vn: "local", en: "local" },
};

export function savedSettings(storage?: Pick<Storage, "getItem">) {
	try {
		storage ??= localStorage;
		const current = storage.getItem(STORAGE_KEY);
		if (current) {
			const settings = Schema.decodeUnknownSync(Settings)(JSON.parse(current));
			for (const kind of ["tts", "stt"] as const)
				for (const language of ["vn", "en"] as const) {
					const model = findLocalModel(kind, settings.models[kind][language]);
					if (!model?.languages.includes(language)) return null;
				}
			return settings;
		}
		const v2 = storage.getItem("speech-preferences-v2");
		if (v2)
			return {
				preferences: Schema.decodeUnknownSync(SpeechPreferences)(JSON.parse(v2)),
				models: DEFAULT_LOCAL_MODELS,
			};
		const preferences = {
			tts: { ...BROWSER_PREFERENCES.tts },
			stt: { ...BROWSER_PREFERENCES.stt },
		};
		const models = { tts: { ...DEFAULT_LOCAL_MODELS.tts }, stt: { ...DEFAULT_LOCAL_MODELS.stt } };
		let found = false;
		for (const kind of ["tts", "stt"] as const)
			for (const language of ["vn", "en"] as const) {
				const old = storage.getItem(`${kind}-${language}-${kind === "tts" ? "voice" : "model"}`);
				if (!old) continue;
				const id = kind === "stt" ? old.replace(/^whisper-(vn|en)-/, "whisper-") : old;
				const model = findLocalModel(kind, id);
				if (model?.languages.includes(language)) {
					preferences[kind][language] = "local";
					models[kind][language] = id;
					found = true;
				} else if (old.startsWith("web-speech-")) found = true;
			}
		return found ? { preferences, models } : null;
	} catch {
		return null;
	}
}

export function persistSettings(preferences: SpeechPreferences, models: LocalSelections) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences, models }));
	} catch {
		/* Storage is optional. */
	}
}

export function selectionValue(
	preferences: SpeechPreferences,
	models: LocalSelections,
	kind: SpeechKind,
	language: "vn" | "en",
	voiceId?: string,
) {
	if (kind === "tts" && preferences.tts[language] === "browser" && voiceId)
		return `${BROWSER_VOICE_PREFIX}${voiceId}`;
	return preferences[kind][language] === "local"
		? models[kind][language]
		: preferences[kind][language];
}
