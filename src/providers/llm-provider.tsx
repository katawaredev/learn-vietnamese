import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export interface LLMModelOption {
	id: string;
	name: string;
	modelId: string; // The actual model identifier for WebLLM
}

interface LLMContextValue {
	selectedModel: LLMModelOption | null;
	setSelectedModel: (model: LLMModelOption) => void;
	availableModels: LLMModelOption[];
	thinkingEnabled: boolean;
	setThinkingEnabled: (enabled: boolean) => void;
}

const LLMContext = createContext<LLMContextValue | undefined>(undefined);

// Filter models by VRAM requirements - only show models that can run in typical browsers
// Most users have 2-4GB available VRAM, so limit to 3GB to be safe
const MAX_VRAM_MB = 3000;

const STORAGE_KEY = "llm-selected-model";
const THINKING_STORAGE_KEY = "llm-thinking-enabled";

export function LLMProvider({ children }: { children: ReactNode }) {
	const [availableModels, setAvailableModels] = useState<LLMModelOption[]>([]);
	const [selectedModel, setSelectedModelState] =
		useState<LLMModelOption | null>(null);
	const [thinkingEnabled, setThinkingEnabledState] = useState<boolean>(true);

	useEffect(() => {
		// Dynamically import @mlc-ai/web-llm only in the browser - it's WebGPU-only
		// and its bundled CJS dependencies cannot be loaded in Node.js/SSR context
		import("@mlc-ai/web-llm").then(({ prebuiltAppConfig }) => {
			const models = prebuiltAppConfig.model_list
				.filter(
					(model) =>
						model.vram_required_MB &&
						model.vram_required_MB <= MAX_VRAM_MB &&
						model.low_resource_required,
				)
				.map((model) => ({
					id: model.model_id,
					name: model.model_id.replace(/-MLC$/, "").replace(/-/g, " "),
					modelId: model.model_id,
				}))
				.sort((a, b) => {
					return a.modelId.localeCompare(b.modelId);
				});

			setAvailableModels(models);

			const savedModelId = localStorage.getItem(STORAGE_KEY);
			const savedModel = savedModelId
				? models.find((m) => m.id === savedModelId)
				: null;
			setSelectedModelState(savedModel ?? models[0] ?? null);
		});

		const savedThinking = localStorage.getItem(THINKING_STORAGE_KEY);
		if (savedThinking !== null) {
			setThinkingEnabledState(savedThinking === "true");
		}
	}, []);

	const setSelectedModel = (model: LLMModelOption) => {
		setSelectedModelState(model);
		localStorage.setItem(STORAGE_KEY, model.id);
	};

	const setThinkingEnabled = (enabled: boolean) => {
		setThinkingEnabledState(enabled);
		localStorage.setItem(THINKING_STORAGE_KEY, String(enabled));
	};

	return (
		<LLMContext.Provider
			value={{
				selectedModel,
				setSelectedModel,
				availableModels,
				thinkingEnabled,
				setThinkingEnabled,
			}}
		>
			{children}
		</LLMContext.Provider>
	);
}

export function useLLM() {
	const context = useContext(LLMContext);
	if (!context) {
		throw new Error("useLLM must be used within an LLMProvider");
	}
	return context;
}
