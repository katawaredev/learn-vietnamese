export const BROWSER_CHAT_MODELS = [
	{ id: "Qwen3.5-2B-q4f16_1-MLC", name: "Qwen 3.5 2B (Balanced)", memoryGB: 2.3 },
	{ id: "Qwen3.5-0.8B-q4f16_1-MLC", name: "Qwen 3.5 0.8B (Small download)", memoryGB: 1.7 },
	{ id: "Qwen3.5-4B-q4f16_1-MLC", name: "Qwen 3.5 4B (Higher quality)", memoryGB: 3.9 },
] as const;
export const DEFAULT_CHAT_MODEL = BROWSER_CHAT_MODELS[0].id;
export const findBrowserChatModel = (id: string) =>
	BROWSER_CHAT_MODELS.find((model) => model.id === id);
