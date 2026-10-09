import { Effect } from "effect";
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { errorMessage } from "~/lib/app-error";
import { getCapabilities } from "./client";
import {
	EMPTY_CAPABILITIES,
	SpeechPreferences,
	type Capabilities,
	type Language,
} from "./contracts";
import { findLocalModel, type SpeechKind } from "./local/catalog";
import { releaseAllLocalModels, releaseLocalModel, selectLocalModel } from "./local/client";
import {
	BROWSER_VOICE_PREFIX,
	LOCAL_PREFERENCES,
	DEFAULT_LOCAL_MODELS,
	persistSettings,
	savedSettings,
	type LocalSelections,
} from "./preferences";

export interface BrowserVoice {
	id: string;
	name: string;
	language: Language;
}
interface SpeechContextValue {
	capabilities: Capabilities;
	preferences: SpeechPreferences;
	localModels: LocalSelections;
	voices: BrowserVoice[];
	voiceIds: Partial<Record<Language, string>>;
	setSelection: (kind: SpeechKind, language: Language, value: string) => void;
	resetLanguage: (language: Language) => void;
	error: string | null;
	ready: boolean;
}
const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({ children }: { children: ReactNode }) {
	const [capabilities, setCapabilities] = useState(EMPTY_CAPABILITIES);
	const [preferences, setPreferences] = useState(LOCAL_PREFERENCES);
	const [localModels, setLocalModels] = useState(DEFAULT_LOCAL_MODELS);
	const changed = useRef(false);
	const [voices, setVoices] = useState<BrowserVoice[]>([]);
	const [voiceIds, setVoiceIds] = useState<Partial<Record<Language, string>>>({});
	const [error, setError] = useState<string | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		const saved = savedSettings();
		if (saved) {
			// oxlint-disable-next-line react/set-state-in-effect -- Read browser storage after SSR hydration.
			setPreferences(saved.preferences);
			setLocalModels(saved.models);
		}
		setReady(true);
		void Effect.runPromise(getCapabilities, { signal: controller.signal })
			.then((value) => {
				if (controller.signal.aborted) return;
				setCapabilities(value);
				if (!saved && !changed.current)
					setPreferences({
						tts: {
							vn: value.tts.vn ? "server" : "local",
							en: value.tts.en ? "server" : "local",
						},
						stt: { vn: value.stt ? "server" : "local", en: value.stt ? "server" : "local" },
					});
			})
			.catch((reason: unknown) => {
				if (!controller.signal.aborted) {
					setError(errorMessage(reason));
				}
			});
		return () => {
			controller.abort();
			releaseAllLocalModels();
		};
	}, []);

	useEffect(() => {
		if (!window.speechSynthesis) return undefined;
		const load = () => {
			const available = window.speechSynthesis.getVoices().flatMap((voice): BrowserVoice[] => {
				const language = voice.lang.toLowerCase().startsWith("vi")
					? "vn"
					: voice.lang.toLowerCase().startsWith("en")
						? "en"
						: null;
				return language ? [{ id: voice.voiceURI, name: voice.name, language }] : [];
			});
			setVoices(available);
			setVoiceIds((previous) =>
				Object.fromEntries(
					(["vn", "en"] as const).map((language) => {
						let saved: string | null = null;
						let legacy: string | null = null;
						try {
							saved = localStorage.getItem(`speech-voice-${language}`);
							legacy = localStorage.getItem(`tts-${language}-voice`);
						} catch {
							/* Storage is optional. */
						}
						const selected = available.find(
							(voice) =>
								voice.language === language &&
								(voice.id === (previous[language] ?? saved) ||
									(!saved && `web-speech-${language}-${voice.name}` === legacy)),
						);
						return [
							language,
							selected?.id ?? available.find((voice) => voice.language === language)?.id,
						];
					}),
				),
			);
		};
		load();
		window.speechSynthesis.addEventListener("voiceschanged", load);
		return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
	}, []);

	const value = useMemo<SpeechContextValue>(
		() => ({
			capabilities,
			preferences,
			localModels,
			voices,
			voiceIds,
			error,
			ready,
			resetLanguage: (language) => {
				changed.current = true;
				const next = {
					tts: { ...preferences.tts, [language]: "local" as const },
					stt: { ...preferences.stt, [language]: "local" as const },
				};
				const nextModels = {
					tts: { ...localModels.tts, [language]: DEFAULT_LOCAL_MODELS.tts[language] },
					stt: { ...localModels.stt, [language]: DEFAULT_LOCAL_MODELS.stt[language] },
				};
				setPreferences(next);
				setLocalModels(nextModels);
				persistSettings(next, nextModels);
				releaseLocalModel("tts", language);
				releaseLocalModel("stt", language);
			},
			setSelection: (kind, language, selection) => {
				const voice =
					kind === "tts" && selection.startsWith(BROWSER_VOICE_PREFIX)
						? voices.find(
								(item) =>
									item.language === language &&
									item.id === selection.slice(BROWSER_VOICE_PREFIX.length),
							)
						: undefined;
				const model = findLocalModel(kind, selection);
				if (
					selection !== "browser" &&
					selection !== "server" &&
					!voice &&
					!model?.languages.includes(language)
				)
					return;
				changed.current = true;
				const backend = model ? "local" : voice ? "browser" : (selection as "browser" | "server");
				if (voice) {
					setVoiceIds((previous) => ({ ...previous, [language]: voice.id }));
					try {
						localStorage.setItem(`speech-voice-${language}`, voice.id);
					} catch {
						/* Storage is optional. */
					}
				}
				const next = { ...preferences, [kind]: { ...preferences[kind], [language]: backend } };
				const nextModels = model
					? { ...localModels, [kind]: { ...localModels[kind], [language]: model.id } }
					: localModels;
				setPreferences(next);
				setLocalModels(nextModels);
				persistSettings(next, nextModels);
				if (model) {
					try {
						selectLocalModel(kind, language, model.id);
					} catch (reason) {
						setError(errorMessage(reason));
					}
				} else releaseLocalModel(kind, language);
			},
		}),
		[capabilities, preferences, localModels, voices, voiceIds, error, ready],
	);
	return <SpeechContext value={value}>{children}</SpeechContext>;
}

export function useSpeech() {
	const value = useContext(SpeechContext);
	if (!value) throw new Error("useSpeech must be used within SpeechProvider");
	return value;
}
