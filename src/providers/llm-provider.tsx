import { prebuiltAppConfig } from "@mlc-ai/web-llm";
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
	selectedModel: LLMModelOption;
	setSelectedModel: (model: LLMModelOption) => void;
	availableModels: LLMModelOption[];
}

const LLMContext = createContext<LLMContextValue | undefined>(undefined);

// Filter models by VRAM requirements - only show models that can run in typical browsers
// Most users have 2-4GB available VRAM, so limit to 3GB to be safe
const MAX_VRAM_MB = 3000;

// Get available models from WebLLM's prebuilt config
const AVAILABLE_MODELS: LLMModelOption[] = prebuiltAppConfig.model_list
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
		// Sort by model ID for consistent ordering
		return a.modelId.localeCompare(b.modelId);
	});

if (AVAILABLE_MODELS.length === 0) {
	throw new Error(
		`No models found with VRAM <= ${MAX_VRAM_MB}MB. WebLLM may have changed their model format.`,
	);
}

// Prefer smallest available model (likely most compatible)
const DEFAULT_MODEL = AVAILABLE_MODELS[0];
const STORAGE_KEY = "llm-selected-model";

export function LLMProvider({ children }: { children: ReactNode }) {
	const [selectedModel, setSelectedModelState] =
		useState<LLMModelOption>(DEFAULT_MODEL);

	// Load saved model from localStorage
	useEffect(() => {
		const savedModelId = localStorage.getItem(STORAGE_KEY);
		if (savedModelId) {
			const savedModel = AVAILABLE_MODELS.find(
				(model) => model.id === savedModelId,
			);
			if (savedModel) {
				setSelectedModelState(savedModel);
			}
		}
	}, []);

	const setSelectedModel = (model: LLMModelOption) => {
		setSelectedModelState(model);
		localStorage.setItem(STORAGE_KEY, model.id);
	};

	return (
		<LLMContext.Provider
			value={{
				selectedModel,
				setSelectedModel,
				availableModels: AVAILABLE_MODELS,
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
