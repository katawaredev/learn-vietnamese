import { useChat } from "@tanstack/ai-react";
import { Schema } from "effect";
import { useEffect, useState, useSyncExternalStore } from "react";
import { releaseLocalModel } from "~/features/speech/local/client";
import { ChatModels, type ChatRequest } from "./contracts";
import { BROWSER_CHAT_MODELS, findBrowserChatModel } from "./catalog";
import { conversationConnection } from "./connection";
import {
	getLocalChatStatus,
	getServerChatStatus,
	releaseLocalChat,
	subscribeLocalChat,
} from "./local";
import {
	DEFAULT_CHAT_PREFERENCES,
	persistChatPreferences,
	savedChatPreferences,
	type ChatPreferences,
} from "./preferences";

const EMPTY_MODELS: ChatModels = { models: [], defaultModel: null, thinking: false };
export function useConversation(mode: ChatRequest["mode"]) {
	const [preferences, setPreferences] = useState(DEFAULT_CHAT_PREFERENCES);
	const [serverModels, setServerModels] = useState(EMPTY_MODELS);
	const [localAvailable, setLocalAvailable] = useState(false);
	const [ready, setReady] = useState(false);
	const [catalogError, setCatalogError] = useState<string | null>(null);
	const localStatus = useSyncExternalStore(
		subscribeLocalChat,
		getLocalChatStatus,
		getServerChatStatus,
	);
	const chat = useChat({
		connection: conversationConnection,
		forwardedProps: { mode, ...preferences },
	});
	useEffect(() => {
		const controller = new AbortController();
		const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
		const models = fetch("/api/chat/models", { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok)
					throw new Error(
						"Could not check server conversation models. Local chat is still available on supported devices.",
					);
				return Schema.decodeUnknownSync(ChatModels)(await response.json());
			})
			.catch((reason: unknown) => {
				if (!controller.signal.aborted)
					setCatalogError(
						reason instanceof Error
							? reason.message
							: "Could not check server conversation models.",
					);
				return EMPTY_MODELS;
			});
		void Promise.all([
			models,
			gpu
				? gpu
						.requestAdapter()
						.then(Boolean)
						.catch(() => false)
				: false,
		]).then(([catalog, gpuAvailable]) => {
			if (controller.signal.aborted) return;
			setServerModels(catalog);
			setLocalAvailable(gpuAvailable);
			const saved = savedChatPreferences();
			const valid =
				saved &&
				(saved.backend === "local"
					? !!findBrowserChatModel(saved.model)
					: catalog.models.includes(saved.model));
			setPreferences(
				valid
					? saved
					: catalog.defaultModel
						? { backend: "server", model: catalog.defaultModel, thinking: false }
						: DEFAULT_CHAT_PREFERENCES,
			);
			setReady(true);
		});
		return () => {
			controller.abort();
			releaseLocalChat();
			releaseLocalModel("tts", "en");
			releaseLocalModel("stt", "en");
		};
	}, []);
	const updatePreferences = (next: ChatPreferences) => {
		chat.stop();
		if (next.backend !== preferences.backend || next.model !== preferences.model) {
			chat.clear();
			releaseLocalChat();
		}
		setPreferences(next);
		persistChatPreferences(next);
	};
	const localModel = findBrowserChatModel(preferences.model);
	const available =
		ready &&
		(preferences.backend === "local"
			? localAvailable
			: serverModels.models.includes(preferences.model));
	return {
		...chat,
		preferences,
		ready,
		available,
		catalogError,
		localStatus,
		localModel,
		thinkingAvailable:
			mode === "practice" && (preferences.backend === "local" || serverModels.thinking),
		selectedModel:
			preferences.backend === "server" ? `server:${preferences.model}` : preferences.model,
		modelOptions: [
			...BROWSER_CHAT_MODELS.map((model) => ({
				label: model.name,
				value: model.id,
				disabled: !localAvailable,
			})),
			...serverModels.models.map((id) => ({ label: `${id} (Server)`, value: `server:${id}` })),
		],
		setModel: (value: string) => {
			const isServer = value.startsWith("server:");
			const model = isServer ? value.slice(7) : value;
			if (
				isServer
					? !serverModels.models.includes(model)
					: !findBrowserChatModel(model) || !localAvailable
			)
				return;
			updatePreferences({ ...preferences, backend: isServer ? "server" : "local", model });
		},
		setThinking: (thinking: boolean) => updatePreferences({ ...preferences, thinking }),
		unavailableMessage: !ready
			? "Checking conversation models…"
			: "Open AI settings to choose an available conversation model. Local chat requires WebGPU; server chat requires a configured service.",
	};
}
export type Conversation = ReturnType<typeof useConversation>;
