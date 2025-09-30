import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export type STTProvider = "web-speech" | "whisper" | "phowhisper";

export interface STTModelOption {
	id: string;
	name: string;
	provider: STTProvider;
	modelSize?: "tiny" | "small" | "medium" | "large"; // For Whisper
	modelPath?: string; // For PhoWhisper
}

interface STTContextValue {
	selectedModel: STTModelOption;
	setSelectedModel: (model: STTModelOption) => void;
	availableModels: STTModelOption[];
}

const STTContext = createContext<STTContextValue | undefined>(undefined);

const PHOWHISPER_MODELS: STTModelOption[] = [
	{
		id: "phowhisper-tiny",
		name: "PhoWhisper Tiny",
		provider: "phowhisper",
		modelPath: "huuquyet/PhoWhisper-tiny",
	},
	{
		id: "phowhisper-small",
		name: "PhoWhisper Small",
		provider: "phowhisper",
		modelPath: "huuquyet/PhoWhisper-small",
	},
	{
		id: "phowhisper-base",
		name: "PhoWhisper Base",
		provider: "phowhisper",
		modelPath: "huuquyet/PhoWhisper-base",
	},
	{
		id: "phowhisper-medium",
		name: "PhoWhisper Medium",
		provider: "phowhisper",
		modelPath: "huuquyet/PhoWhisper-medium",
	},
	{
		id: "phowhisper-large",
		name: "PhoWhisper Large",
		provider: "phowhisper",
		modelPath: "huuquyet/PhoWhisper-large",
	},
];

const WHISPER_MODELS: STTModelOption[] = [
	{
		id: "whisper-tiny",
		name: "Whisper Tiny",
		provider: "whisper",
		modelSize: "tiny",
	},
	{
		id: "whisper-small",
		name: "Whisper Small",
		provider: "whisper",
		modelSize: "small",
	},
	{
		id: "whisper-medium",
		name: "Whisper Medium",
		provider: "whisper",
		modelSize: "medium",
	},
	{
		id: "whisper-large",
		name: "Whisper Large",
		provider: "whisper",
		modelSize: "large",
	},
];

function getWebSpeechSTTOption(): STTModelOption | null {
	if (
		typeof window === "undefined" ||
		(!window.webkitSpeechRecognition && !window.SpeechRecognition)
	) {
		return null;
	}

	return {
		id: "web-speech-stt",
		name: "Web Speech API (Browser Native)",
		provider: "web-speech",
	};
}

const DEFAULT_MODEL = PHOWHISPER_MODELS[0]; // phowhisper-tiny
const STORAGE_KEY = "stt-selected-model";

export function STTProvider({ children }: { children: ReactNode }) {
	const [selectedModel, setSelectedModelState] =
		useState<STTModelOption>(DEFAULT_MODEL);
	const [webSpeechSTT, setWebSpeechSTT] = useState<STTModelOption | null>(null);

	// Check Web Speech API availability
	useEffect(() => {
		const webSpeechOption = getWebSpeechSTTOption();
		setWebSpeechSTT(webSpeechOption);
	}, []);

	// Load saved model from localStorage
	useEffect(() => {
		const savedModelId = localStorage.getItem(STORAGE_KEY);
		if (savedModelId) {
			const allModels = [
				...PHOWHISPER_MODELS,
				...WHISPER_MODELS,
				...(webSpeechSTT ? [webSpeechSTT] : []),
			];
			const savedModel = allModels.find((model) => model.id === savedModelId);
			if (savedModel) {
				setSelectedModelState(savedModel);
			}
		}
	}, [webSpeechSTT]);

	const setSelectedModel = (model: STTModelOption) => {
		setSelectedModelState(model);
		localStorage.setItem(STORAGE_KEY, model.id);
	};

	const availableModels = [
		...PHOWHISPER_MODELS,
		...WHISPER_MODELS,
		...(webSpeechSTT ? [webSpeechSTT] : []),
	];

	return (
		<STTContext.Provider
			value={{
				selectedModel,
				setSelectedModel,
				availableModels,
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
