import { Effect } from "effect";
import type { ChatModels } from "~/features/chat/contracts";
import { readEndpoint, type Endpoint } from "./config";

export function allowedChatModels(config: Endpoint) {
	return [
		...new Set([
			config.model,
			...(process.env.AI_CHAT_MODELS ?? "")
				.split(",")
				.map((id) => id.trim())
				.filter(Boolean),
		]),
	];
}

export const chatModels = readEndpoint("CHAT").pipe(
	Effect.catchTag("AppError", () => Effect.succeed(null)),
	Effect.map((config): ChatModels => ({
		models: config ? allowedChatModels(config) : [],
		defaultModel: config?.model ?? null,
		thinking: !!config && ["ollama", "qwen"].includes(process.env.AI_CHAT_THINKING ?? ""),
	})),
);
