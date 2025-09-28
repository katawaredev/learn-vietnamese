import type { VoiceId } from "@diffusionstudio/vits-web";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export type TTSProvider = "web-speech" | "vits";

export interface TTSVoiceOption {
	id: string;
	name: string;
	provider: TTSProvider;
	voiceId?: VoiceId; // For VITS
	webSpeechVoice?: SpeechSynthesisVoice; // For Web Speech API
}

interface TTSContextValue {
	selectedVoice: TTSVoiceOption;
	setSelectedVoice: (voice: TTSVoiceOption) => void;
	availableVoices: TTSVoiceOption[];
}

const TTSContext = createContext<TTSContextValue | undefined>(undefined);

const VITS_VOICES: TTSVoiceOption[] = [
	{
		id: "vi_VN-25hours_single-low",
		name: "Vietnamese 25 Hours (Low Quality)",
		provider: "vits",
		voiceId: "vi_VN-25hours_single-low",
	},
	{
		id: "vi_VN-vais1000-medium",
		name: "Vietnamese VAIS 1000 (Medium Quality)",
		provider: "vits",
		voiceId: "vi_VN-vais1000-medium",
	},
	{
		id: "vi_VN-vivos-x_low",
		name: "Vietnamese Vivos (Low Quality)",
		provider: "vits",
		voiceId: "vi_VN-vivos-x_low",
	},
];

function getWebSpeechVoices(): TTSVoiceOption[] {
	if (typeof window === "undefined" || !window.speechSynthesis) {
		return [];
	}

	const voices = window.speechSynthesis.getVoices();
	const vietnameseVoices = voices.filter(
		(voice) =>
			voice.lang.startsWith("vi") ||
			voice.lang.includes("VN") ||
			voice.name.toLowerCase().includes("vietnam"),
	);

	return vietnameseVoices.map((voice) => ({
		id: `web-speech-${voice.name}`,
		name: `${voice.name} (${voice.lang})`,
		provider: "web-speech" as const,
		webSpeechVoice: voice,
	}));
}

const DEFAULT_VOICE = VITS_VOICES[1]; // vi_VN-vais1000-medium
const STORAGE_KEY = "tts-selected-voice";

export function TTSProvider({ children }: { children: ReactNode }) {
	const [selectedVoice, setSelectedVoiceState] =
		useState<TTSVoiceOption>(DEFAULT_VOICE);
	const [webSpeechVoices, setWebSpeechVoices] = useState<TTSVoiceOption[]>([]);

	// Load voices and handle browser compatibility
	useEffect(() => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		const loadVoices = () => {
			const voices = getWebSpeechVoices();
			setWebSpeechVoices(voices);
		};

		// Load voices immediately if available
		loadVoices();

		// Some browsers load voices asynchronously
		window.speechSynthesis.onvoiceschanged = loadVoices;

		return () => {
			window.speechSynthesis.onvoiceschanged = null;
		};
	}, []);

	// Load saved voice from localStorage
	useEffect(() => {
		const savedVoiceId = localStorage.getItem(STORAGE_KEY);
		if (savedVoiceId) {
			const allVoices = [...VITS_VOICES, ...webSpeechVoices];
			const savedVoice = allVoices.find((voice) => voice.id === savedVoiceId);
			if (savedVoice) {
				setSelectedVoiceState(savedVoice);
			}
		}
	}, [webSpeechVoices]);

	const setSelectedVoice = (voice: TTSVoiceOption) => {
		setSelectedVoiceState(voice);
		localStorage.setItem(STORAGE_KEY, voice.id);
	};

	const availableVoices = [...VITS_VOICES, ...webSpeechVoices];

	return (
		<TTSContext.Provider
			value={{
				selectedVoice,
				setSelectedVoice,
				availableVoices,
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
