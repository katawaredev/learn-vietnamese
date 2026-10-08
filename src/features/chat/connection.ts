import { EventType, type StreamChunk } from "@tanstack/ai";
import { fetchServerSentEvents, type ConnectConnectionAdapter } from "@tanstack/ai-client";
import { Schema } from "effect";
import { ChatRequest } from "./contracts";
import { generateLocalChat } from "./local";

const server = fetchServerSentEvents("/api/chat");
export const conversationConnection: ConnectConnectionAdapter = {
	async *connect(messages, data, signal, context): AsyncGenerator<StreamChunk> {
		if (data?.backend === "server") {
			yield* server.connect(messages, data, signal, context);
			return;
		}
		const input = Schema.decodeUnknownSync(ChatRequest)({
			...data,
			messages: messages
				.filter((message) => message.role === "user" || message.role === "assistant")
				.map((message) => ({
					id: "id" in message ? message.id : crypto.randomUUID(),
					role: message.role,
					content:
						"parts" in message
							? message.parts
									.filter((part) => part.type === "text")
									.map((part) => part.content)
									.join("\n")
							: typeof message.content === "string"
								? message.content
								: "",
				})),
		});
		const threadId = context?.threadId ?? crypto.randomUUID();
		const runId = context?.runId ?? crypto.randomUUID();
		const messageId = crypto.randomUUID();
		let reasoning = false;
		let text = false;
		yield { type: EventType.RUN_STARTED, threadId, runId };
		for await (const delta of generateLocalChat(input, signal ?? new AbortController().signal)) {
			if (delta.type === "thinking") {
				if (!reasoning) {
					yield { type: EventType.REASONING_START, messageId };
					yield { type: EventType.REASONING_MESSAGE_START, messageId, role: "reasoning" };
					reasoning = true;
				}
				yield { type: EventType.REASONING_MESSAGE_CONTENT, messageId, delta: delta.content };
			} else {
				if (reasoning) {
					yield { type: EventType.REASONING_MESSAGE_END, messageId };
					yield { type: EventType.REASONING_END, messageId };
					reasoning = false;
				}
				if (!text) {
					yield { type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" };
					text = true;
				}
				yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: delta.content };
			}
		}
		if (text) yield { type: EventType.TEXT_MESSAGE_END, messageId };
		yield { type: EventType.RUN_FINISHED, threadId, runId };
	},
};
