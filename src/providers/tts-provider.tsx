import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export type Language = "vn" | "en";
export type TTSProvider = "web-speech" | "mms";

export interface TTSVoiceOption {
	id: string;
	name: string;
	provider: TTSProvider;
	language: Language;
	modelId?: string; // For MMS (HuggingFace transformers)
	webSpeechVoice?: SpeechSynthesisVoice; // For Web Speech API
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

const DEFAULT_VOICE_VN = MMS_VOICES_VN[0]; // Xenova/mms-tts-vie
const DEFAULT_VOICE_EN = MMS_VOICES_EN[0]; // Xenova/mms-tts-eng
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
			const allVoicesVN = [...MMS_VOICES_VN, ...webSpeechVoicesVN];
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
			const allVoicesEN = [...MMS_VOICES_EN, ...webSpeechVoicesEN];
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
			return [...MMS_VOICES_VN, ...webSpeechVoicesVN];
		}
		return [...MMS_VOICES_EN, ...webSpeechVoicesEN];
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
