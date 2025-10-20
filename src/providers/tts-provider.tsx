import type { VoiceId } from "@diffusionstudio/vits-web";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export type Language = "vn" | "en";
export type TTSProvider = "web-speech" | "vits";

export interface TTSVoiceOption {
	id: string;
	name: string;
	provider: TTSProvider;
	language: Language;
	voiceId?: VoiceId; // For VITS
	webSpeechVoice?: SpeechSynthesisVoice; // For Web Speech API
}

interface TTSContextValue {
	getSelectedVoice: (language: Language) => TTSVoiceOption;
	setSelectedVoice: (language: Language, voice: TTSVoiceOption) => void;
	getAvailableVoices: (language: Language) => TTSVoiceOption[];
}

const TTSContext = createContext<TTSContextValue | undefined>(undefined);

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

const DEFAULT_VOICE_VN = VITS_VOICES_VN[1]; // vi_VN-vais1000-medium
const DEFAULT_VOICE_EN = VITS_VOICES_EN[4]; // en_US-ryan-medium
const STORAGE_KEY_VN = "tts-vn-voice";
const STORAGE_KEY_EN = "tts-en-voice";

export function TTSProvider({ children }: { children: ReactNode }) {
	const [selectedVoiceVN, setSelectedVoiceVNState] =
		useState<TTSVoiceOption>(DEFAULT_VOICE_VN);
	const [selectedVoiceEN, setSelectedVoiceENState] =
		useState<TTSVoiceOption>(DEFAULT_VOICE_EN);
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
		};

		// Load voices immediately if available
		loadVoices();

		// Some browsers load voices asynchronously
		window.speechSynthesis.onvoiceschanged = loadVoices;

		return () => {
			window.speechSynthesis.onvoiceschanged = null;
		};
	}, []);

	// Load saved voices from localStorage
	useEffect(() => {
		// Load Vietnamese voice
		const savedVoiceIdVN = localStorage.getItem(STORAGE_KEY_VN);
		if (savedVoiceIdVN) {
			const allVoicesVN = [...VITS_VOICES_VN, ...webSpeechVoicesVN];
			const savedVoice = allVoicesVN.find(
				(voice) => voice.id === savedVoiceIdVN,
			);
			if (savedVoice) {
				setSelectedVoiceVNState(savedVoice);
			}
		}

		// Load English voice
		const savedVoiceIdEN = localStorage.getItem(STORAGE_KEY_EN);
		if (savedVoiceIdEN) {
			const allVoicesEN = [...VITS_VOICES_EN, ...webSpeechVoicesEN];
			const savedVoice = allVoicesEN.find(
				(voice) => voice.id === savedVoiceIdEN,
			);
			if (savedVoice) {
				setSelectedVoiceENState(savedVoice);
			}
		}
	}, [webSpeechVoicesVN, webSpeechVoicesEN]);

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
			return [...VITS_VOICES_VN, ...webSpeechVoicesVN];
		}
		return [...VITS_VOICES_EN, ...webSpeechVoicesEN];
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
