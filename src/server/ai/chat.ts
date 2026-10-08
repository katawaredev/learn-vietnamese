import {
	chat,
	chatParamsFromRequestBody,
	EventType,
	toServerSentEventsResponse,
	type StreamChunk,
} from "@tanstack/ai";
import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";
import { Effect, Schema } from "effect";
import { ChatRequest } from "~/features/chat/contracts";
import { AppError } from "~/lib/app-error";
import { conversationPrompt } from "~/features/chat/prompts";
import { allowedChatModels } from "./chat-models";
import { requireEndpoint } from "./config";
import { readJson } from "./http";

export function streamChat(request: Request) {
	return Effect.gen(function* () {
		const body = yield* readJson(request);
		const params = yield* Effect.tryPromise({
			try: () => chatParamsFromRequestBody(body),
			catch: () =>
				new AppError({
					code: "validation",
					status: 400,
					message: "Invalid conversation transport.",
				}),
		});
		const input = yield* Schema.decodeUnknownEffect(ChatRequest)({
			...params.forwardedProps,
			// The wire protocol emits reasoning duplicates alongside the canonical UI messages.
			messages: params.messages
				.filter((message) => !["reasoning"].includes(message.role))
				.map((message) => ({
					id: "id" in message ? message.id : undefined,
					role: message.role,
					content: "content" in message ? (message.content ?? "") : "",
				})),
		}).pipe(
			Effect.mapError(
				() =>
					new AppError({
						code: "validation",
						status: 400,
						message: "Invalid conversation request.",
					}),
			),
		);
		const messages = input.messages.map((message) => ({
			role: message.role,
			content: message.content,
		}));
		if (messages.at(-1)?.role !== "user" || !messages.at(-1)?.content.trim()) {
			return yield* Effect.fail(
				new AppError({
					code: "validation",
					status: 400,
					message: "A conversation must end with a learner's message.",
				}),
			);
		}
		const config = yield* requireEndpoint("CHAT");
		const model = input.model ?? config.model;
		if (!allowedChatModels(config).includes(model)) {
			return yield* Effect.fail(
				new AppError({
					code: "validation",
					status: 400,
					message: "Choose an available conversation model in AI settings.",
				}),
			);
		}
		const abortController = new AbortController();
		const abort = () => abortController.abort();
		request.signal.addEventListener("abort", abort, { once: true });
		if (request.signal.aborted) abort();
		const prompt = conversationPrompt(input);
		const thinking = input.mode === "practice" && (input.thinking ?? false);
		const stream = chat({
			adapter: openaiCompatibleText(model, {
				baseURL: config.baseURL,
				apiKey: config.apiKey ?? "local",
				api: "chat-completions",
				maxRetries: 0,
				timeout: 90_000,
			}),
			messages: input.mode === "translate" ? messages.slice(-1) : messages,
			modelOptions: {
				max_tokens: thinking ? 1024 : 512,
				temperature: input.mode === "translate" ? 0.3 : 0.7,
				...(process.env.AI_CHAT_THINKING === "ollama"
					? { reasoning_effort: thinking ? "medium" : "none" }
					: process.env.AI_CHAT_THINKING === "qwen"
						? { chat_template_kwargs: { enable_thinking: thinking } }
						: {}),
			},
			threadId: params.threadId,
			runId: params.runId,
			systemPrompts: [prompt],
			abortController,
		});
		async function* boundedStream(): AsyncGenerator<StreamChunk> {
			const timeout = setTimeout(abort, 90_000);
			try {
				for await (const chunk of stream) {
					if (chunk.type === EventType.RUN_ERROR) {
						yield {
							type: EventType.RUN_ERROR,
							message: "The chat service failed. Please try again.",
							code: "provider",
						};
						return;
					}
					yield chunk;
				}
			} catch {
				yield {
					type: EventType.RUN_ERROR,
					message: "The chat service failed or timed out. Please try again.",
					code: "unavailable",
				};
			} finally {
				clearTimeout(timeout);
				request.signal.removeEventListener("abort", abort);
			}
		}
		return toServerSentEventsResponse(boundedStream(), {
			abortController,
			headers: { "Cache-Control": "no-store" },
		});
	});
}
