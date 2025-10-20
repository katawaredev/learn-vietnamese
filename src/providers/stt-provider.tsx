import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { Language } from "./tts-provider";

export type STTProvider = "web-speech" | "whisper" | "phowhisper";

export interface STTModelOption {
	id: string;
	name: string;
	provider: STTProvider;
	language: Language;
	modelSize?: "tiny" | "small" | "medium" | "large"; // For Whisper
	modelPath?: string; // For PhoWhisper
}

interface STTContextValue {
	getSelectedModel: (language: Language) => STTModelOption;
	setSelectedModel: (language: Language, model: STTModelOption) => void;
	getAvailableModels: (language: Language) => STTModelOption[];
}

const STTContext = createContext<STTContextValue | undefined>(undefined);

const PHOWHISPER_MODELS: STTModelOption[] = [
	{
		id: "phowhisper-tiny",
		name: "PhoWhisper Tiny",
		provider: "phowhisper",
		language: "vn",
		modelPath: "huuquyet/PhoWhisper-tiny",
	},
	{
		id: "phowhisper-small",
		name: "PhoWhisper Small",
		provider: "phowhisper",
		language: "vn",
		modelPath: "huuquyet/PhoWhisper-small",
	},
	{
		id: "phowhisper-base",
		name: "PhoWhisper Base",
		provider: "phowhisper",
		language: "vn",
		modelPath: "huuquyet/PhoWhisper-base",
	},
	{
		id: "phowhisper-medium",
		name: "PhoWhisper Medium",
		provider: "phowhisper",
		language: "vn",
		modelPath: "huuquyet/PhoWhisper-medium",
	},
	{
		id: "phowhisper-large",
		name: "PhoWhisper Large",
		provider: "phowhisper",
		language: "vn",
		modelPath: "huuquyet/PhoWhisper-large",
	},
];

const WHISPER_MODELS_VN: STTModelOption[] = [
	{
		id: "whisper-vn-tiny",
		name: "Whisper Tiny",
		provider: "whisper",
		language: "vn",
		modelSize: "tiny",
	},
	{
		id: "whisper-vn-small",
		name: "Whisper Small",
		provider: "whisper",
		language: "vn",
		modelSize: "small",
	},
	{
		id: "whisper-vn-medium",
		name: "Whisper Medium",
		provider: "whisper",
		language: "vn",
		modelSize: "medium",
	},
	{
		id: "whisper-vn-large",
		name: "Whisper Large",
		provider: "whisper",
		language: "vn",
		modelSize: "large",
	},
];

const WHISPER_MODELS_EN: STTModelOption[] = [
	{
		id: "whisper-en-tiny",
		name: "Whisper Tiny",
		provider: "whisper",
		language: "en",
		modelSize: "tiny",
	},
	{
		id: "whisper-en-small",
		name: "Whisper Small",
		provider: "whisper",
		language: "en",
		modelSize: "small",
	},
	{
		id: "whisper-en-medium",
		name: "Whisper Medium",
		provider: "whisper",
		language: "en",
		modelSize: "medium",
	},
	{
		id: "whisper-en-large",
		name: "Whisper Large",
		provider: "whisper",
		language: "en",
		modelSize: "large",
	},
];

function getWebSpeechSTTOption(language: Language): STTModelOption | null {
	if (
		typeof window === "undefined" ||
		(!window.webkitSpeechRecognition && !window.SpeechRecognition)
	) {
		return null;
	}

	return {
		id: `web-speech-stt-${language}`,
		name: "Web Speech API (Browser Native)",
		provider: "web-speech",
		language,
	};
}

const DEFAULT_MODEL_VN = PHOWHISPER_MODELS[0]; // phowhisper-tiny
const DEFAULT_MODEL_EN = WHISPER_MODELS_EN[0]; // whisper-en-tiny
const STORAGE_KEY_VN = "stt-vn-model";
const STORAGE_KEY_EN = "stt-en-model";

export function STTProvider({ children }: { children: ReactNode }) {
	const [selectedModelVN, setSelectedModelVNState] =
		useState<STTModelOption>(DEFAULT_MODEL_VN);
	const [selectedModelEN, setSelectedModelENState] =
		useState<STTModelOption>(DEFAULT_MODEL_EN);
	const [webSpeechSTTVN, setWebSpeechSTTVN] = useState<STTModelOption | null>(
		null,
	);
	const [webSpeechSTTEN, setWebSpeechSTTEN] = useState<STTModelOption | null>(
		null,
	);

	// Check Web Speech API availability
	useEffect(() => {
		const webSpeechOptionVN = getWebSpeechSTTOption("vn");
		const webSpeechOptionEN = getWebSpeechSTTOption("en");
		setWebSpeechSTTVN(webSpeechOptionVN);
		setWebSpeechSTTEN(webSpeechOptionEN);
	}, []);

	// Load saved models from localStorage
	useEffect(() => {
		// Load Vietnamese model
		const savedModelIdVN = localStorage.getItem(STORAGE_KEY_VN);
		if (savedModelIdVN) {
			const allModelsVN = [
				...PHOWHISPER_MODELS,
				...WHISPER_MODELS_VN,
				...(webSpeechSTTVN ? [webSpeechSTTVN] : []),
			];
			const savedModel = allModelsVN.find(
				(model) => model.id === savedModelIdVN,
			);
			if (savedModel) {
				setSelectedModelVNState(savedModel);
			}
		}

		// Load English model
		const savedModelIdEN = localStorage.getItem(STORAGE_KEY_EN);
		if (savedModelIdEN) {
			const allModelsEN = [
				...WHISPER_MODELS_EN,
				...(webSpeechSTTEN ? [webSpeechSTTEN] : []),
			];
			const savedModel = allModelsEN.find(
				(model) => model.id === savedModelIdEN,
			);
			if (savedModel) {
				setSelectedModelENState(savedModel);
			}
		}
	}, [webSpeechSTTVN, webSpeechSTTEN]);

	const getSelectedModel = (language: Language): STTModelOption => {
		return language === "vn" ? selectedModelVN : selectedModelEN;
	};

	const setSelectedModel = (language: Language, model: STTModelOption) => {
		if (language === "vn") {
			setSelectedModelVNState(model);
			localStorage.setItem(STORAGE_KEY_VN, model.id);
		} else {
			setSelectedModelENState(model);
			localStorage.setItem(STORAGE_KEY_EN, model.id);
		}
	};

	const getAvailableModels = (language: Language): STTModelOption[] => {
		if (language === "vn") {
			return [
				...PHOWHISPER_MODELS,
				...WHISPER_MODELS_VN,
				...(webSpeechSTTVN ? [webSpeechSTTVN] : []),
			];
		}
		return [...WHISPER_MODELS_EN, ...(webSpeechSTTEN ? [webSpeechSTTEN] : [])];
	};

	return (
		<STTContext.Provider
			value={{
				getSelectedModel,
				setSelectedModel,
				getAvailableModels,
			}}
		>
			{children}
		</STTContext.Provider>
	);
}

export function useSTT() {
	const context = useContext(STTContext);
	if (!context) {
		throw new Error("useSTT must be used within an STTProvider");
	}
	return context;
}
