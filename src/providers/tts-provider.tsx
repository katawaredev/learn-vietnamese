import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

import { isLowEndDevice } from "~/utils/device";
import type { ModelDType } from "~/workers/worker-types";

export type Language = "vn" | "en";
export type TTSProvider = "web-speech" | "mms" | "vits";

export interface TTSVoiceOption {
	id: string;
	name: string;
	provider: TTSProvider;
	language: Language;
	modelId?: string; // For MMS (HuggingFace transformers)
	voiceId?: string; // For VITS (@diffusionstudio/vits-web)
	webSpeechVoice?: SpeechSynthesisVoice; // For Web Speech API
	/**
	 * ONNX inference backend. Defaults to "wasm" when omitted.
	 * Only applicable to MMS models. Set to "webgpu" only for models whose
	 * HuggingFace repo includes WebGPU-compatible ONNX exports.
	 */
	device?: "webgpu" | "wasm";
	/**
	 * ONNX model precision/quantization. Defaults to "q8" when omitted.
	 * Only applicable to MMS models. Must match an available ONNX file in the repo.
	 */
	dtype?: ModelDType;
}

interface TTSContextValue {
	getSelectedVoice: (language: Language) => TTSVoiceOption;
	setSelectedVoice: (language: Language, voice: TTSVoiceOption) => void;
	getAvailableVoices: (language: Language) => TTSVoiceOption[];
}

const TTSContext = createContext<TTSContextValue | undefined>(undefined);

const MMS_VOICES_VN: TTSVoiceOption[] = [
	{
		id: "Xenova/mms-tts-vie",
		name: "Vietnamese (MMS)",
		provider: "mms",
		language: "vn",
		modelId: "Xenova/mms-tts-vie",
	},
];

const MMS_VOICES_EN: TTSVoiceOption[] = [
	{
		id: "Xenova/mms-tts-eng",
		name: "English (MMS)",
		provider: "mms",
		language: "en",
		modelId: "Xenova/mms-tts-eng",
	},
];

const VITS_VOICES_VN: TTSVoiceOption[] = [
	{
		id: "vi_VN-25hours_single-low",
		name: "Vietnamese 25 Hours (Low Quality)",
		provider: "vits",
		language: "vn",
		voiceId: "vi_VN-25hours_single-low",
	},
	{
		id: "vi_VN-vais1000-medium",
		name: "Vietnamese VAIS 1000 (Medium Quality)",
		provider: "vits",
		language: "vn",
		voiceId: "vi_VN-vais1000-medium",
	},
	{
		id: "vi_VN-vivos-x_low",
		name: "Vietnamese Vivos (Low Quality)",
		provider: "vits",
		language: "vn",
		voiceId: "vi_VN-vivos-x_low",
	},
];

const VITS_VOICES_EN: TTSVoiceOption[] = [
	{
		id: "en_US-amy-medium",
		name: "Amy (Medium Quality)",
		provider: "vits",
		language: "en",
		voiceId: "en_US-amy-medium",
	},
	{
		id: "en_US-hfc_female-medium",
		name: "HFC Female (Medium Quality)",
		provider: "vits",
		language: "en",
		voiceId: "en_US-hfc_female-medium",
	},
	{
		id: "en_US-hfc_male-medium",
		name: "HFC Male (Medium Quality)",
		provider: "vits",
		language: "en",
		voiceId: "en_US-hfc_male-medium",
	},
	{
		id: "en_US-lessac-medium",
		name: "Lessac (Medium Quality)",
		provider: "vits",
		language: "en",
		voiceId: "en_US-lessac-medium",
	},
	{
		id: "en_US-ryan-medium",
		name: "Ryan (Medium Quality)",
		provider: "vits",
		language: "en",
		voiceId: "en_US-ryan-medium",
	},
];

function getWebSpeechVoices(language: Language): TTSVoiceOption[] {
	if (typeof window === "undefined" || !window.speechSynthesis) {
		return [];
	}

	const voices = window.speechSynthesis.getVoices();
	const langPrefix = language === "vn" ? "vi" : "en";
	const langCode = language === "vn" ? "VN" : "US";
	const langName = language === "vn" ? "vietnam" : "english";

	const filteredVoices = voices.filter(
		(voice) =>
			voice.lang.startsWith(langPrefix) ||
			voice.lang.includes(langCode) ||
			voice.name.toLowerCase().includes(langName),
	);

	return filteredVoices.map((voice) => ({
		id: `web-speech-${language}-${voice.name}`,
		name: `${voice.name} (${voice.lang})`,
		provider: "web-speech" as const,
		language,
		webSpeechVoice: voice,
	}));
}

const STORAGE_KEY_VN = "tts-vn-voice";
const STORAGE_KEY_EN = "tts-en-voice";

function getInitialTTSVoice(language: Language): TTSVoiceOption {
	const storageKey = language === "vn" ? STORAGE_KEY_VN : STORAGE_KEY_EN;
	const savedId =
		typeof localStorage !== "undefined" &&
		typeof localStorage.getItem === "function"
			? localStorage.getItem(storageKey)
			: null;

	if (savedId) {
		const staticVoices =
			language === "vn"
				? [...MMS_VOICES_VN, ...VITS_VOICES_VN]
				: [...MMS_VOICES_EN, ...VITS_VOICES_EN];
		const saved = staticVoices.find((v) => v.id === savedId);
		if (saved) return saved;
		// Web speech voices load async; handled in loadVoices
	}

	return language === "vn" ? MMS_VOICES_VN[0] : MMS_VOICES_EN[0];
}

export function TTSProvider({ children }: { children: ReactNode }) {
	const [selectedVoiceVN, setSelectedVoiceVNState] = useState<TTSVoiceOption>(
		() => getInitialTTSVoice("vn"),
	);
	const [selectedVoiceEN, setSelectedVoiceENState] = useState<TTSVoiceOption>(
		() => getInitialTTSVoice("en"),
	);
	const [webSpeechVoicesVN, setWebSpeechVoicesVN] = useState<TTSVoiceOption[]>(
		[],
	);
	const [webSpeechVoicesEN, setWebSpeechVoicesEN] = useState<TTSVoiceOption[]>(
		[],
	);

	// Load voices and handle browser compatibility
	useEffect(() => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		const loadVoices = () => {
			const voicesVN = getWebSpeechVoices("vn");
			const voicesEN = getWebSpeechVoices("en");
			setWebSpeechVoicesVN(voicesVN);
			setWebSpeechVoicesEN(voicesEN);

			const savedVN = localStorage.getItem(STORAGE_KEY_VN);
			const savedEN = localStorage.getItem(STORAGE_KEY_EN);

			if (savedVN) {
				const saved = voicesVN.find((v) => v.id === savedVN);
				if (saved) setSelectedVoiceVNState(saved);
			} else if (isLowEndDevice() && voicesVN.length > 0) {
				setSelectedVoiceVNState(voicesVN[0]);
			}

			if (savedEN) {
				const saved = voicesEN.find((v) => v.id === savedEN);
				if (saved) setSelectedVoiceENState(saved);
			} else if (isLowEndDevice() && voicesEN.length > 0) {
				setSelectedVoiceENState(voicesEN[0]);
			}
		};

		// Load voices immediately if available
		loadVoices();

		// Some browsers load voices asynchronously
		window.speechSynthesis.onvoiceschanged = loadVoices;

		return () => {
			window.speechSynthesis.onvoiceschanged = null;
		};
	}, []);

	const getSelectedVoice = (language: Language): TTSVoiceOption => {
		return language === "vn" ? selectedVoiceVN : selectedVoiceEN;
	};

	const setSelectedVoice = (language: Language, voice: TTSVoiceOption) => {
		if (language === "vn") {
			setSelectedVoiceVNState(voice);
			localStorage.setItem(STORAGE_KEY_VN, voice.id);
		} else {
			setSelectedVoiceENState(voice);
			localStorage.setItem(STORAGE_KEY_EN, voice.id);
		}
	};

	const getAvailableVoices = (language: Language): TTSVoiceOption[] => {
		if (language === "vn") {
			return [...MMS_VOICES_VN, ...VITS_VOICES_VN, ...webSpeechVoicesVN];
		}
		return [...MMS_VOICES_EN, ...VITS_VOICES_EN, ...webSpeechVoicesEN];
	};

	return (
		<TTSContext.Provider
			value={{
				getSelectedVoice,
				setSelectedVoice,
				getAvailableVoices,
			}}
		>
			{children}
		</TTSContext.Provider>
	);
}

export function useTTS() {
	const context = useContext(TTSContext);
	if (!context) {
		throw new Error("useTTS must be used within a TTSProvider");
	}
	return context;
}
