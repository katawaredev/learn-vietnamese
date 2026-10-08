import { ChatClient } from "@tanstack/ai-client";
import { Schema } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { DEFAULT_CHAT_MODEL } from "./catalog";
import { conversationConnection } from "./connection";
import type { ChatRequest } from "./contracts";
import { generateLocalChat, getLocalChatStatus, localHistory, releaseLocalChat } from "./local";
import { LocalChatRequest } from "./local-contracts";
import { ReasoningParser } from "./reasoning";

const workers: FakeWorker[] = [];
let respond = true;
class FakeWorker {
	onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
	onerror: (() => void) | null = null;
	terminate = vi.fn();
	requests: Array<typeof LocalChatRequest.Type> = [];
	constructor() {
		workers.push(this);
	}
	postMessage(value: unknown) {
		const request = Schema.decodeUnknownSync(LocalChatRequest)(value);
		this.requests.push(request);
		if (!respond) return;
		queueMicrotask(() => {
			for (const content of ["<thi", "nk>consider Vietnamese pronouns</thi", "nk>Xin ", "chào!"])
				this.emit({ requestId: request.requestId, type: "delta", content });
			this.emit({ requestId: request.requestId, type: "done" });
		});
	}
	emit(value: unknown) {
		this.onmessage?.(new MessageEvent("message", { data: value }));
	}
}
const input: ChatRequest = {
	mode: "practice",
	model: DEFAULT_CHAT_MODEL,
	messages: [{ id: "user", role: "user", content: "Hello" }],
};
async function collect(signal = new AbortController().signal, request = input) {
	const result = [];
	for await (const delta of generateLocalChat(request, signal)) result.push(delta);
	return result;
}
beforeEach(() => {
	workers.length = 0;
	respond = true;
	vi.stubGlobal("Worker", FakeWorker);
	Object.defineProperty(navigator, "gpu", {
		configurable: true,
		value: { requestAdapter: () => Promise.resolve({ features: new Set(["shader-f16"]) }) },
	});
});
afterEach(() => {
	releaseLocalChat();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("local conversation runtime", () => {
	it("streams reasoning and text through the real TanStack client, keeping one warm worker", async () => {
		const errors: string[] = [];
		const client = new ChatClient({
			connection: conversationConnection,
			forwardedProps: { ...input, backend: "local", messages: undefined },
			onError: (error) => errors.push(error.message),
		});
		await client.sendMessage("Hello");
		const reply = client.getMessages().at(-1);
		expect(reply?.parts).toContainEqual({ type: "text", content: "Xin chào!" });
		expect(
			reply?.parts.some((part) => part.type === "thinking" && part.content.includes("pronouns")),
		).toBe(true);
		await client.sendMessage("How are you?");
		expect(errors).toEqual([]);
		expect(workers).toHaveLength(1);
		expect(workers[0].requests[1].input.messages.map((message) => message.content)).toEqual([
			"Hello",
			"Xin chào!",
			"How are you?",
		]);
		expect(getLocalChatStatus().state).toBe("ready");
	});

	it("cancels a stalled download immediately, discards the worker and allows retry", async () => {
		respond = false;
		const controller = new AbortController();
		const pending = collect(controller.signal);
		await vi.waitFor(() => expect(workers).toHaveLength(1));
		controller.abort();
		await expect(pending).rejects.toMatchObject({ name: "AbortError" });
		expect(workers[0].terminate).toHaveBeenCalledOnce();
		expect(getLocalChatStatus().state).toBe("idle");
		respond = true;
		await collect();
		expect(workers).toHaveLength(2);
	});

	it("rejects malformed worker responses and replaces the failed worker", async () => {
		respond = false;
		const pending = collect();
		await vi.waitFor(() => expect(workers).toHaveLength(1));
		workers[0].emit({ type: "done" });
		await expect(pending).rejects.toThrow("invalid response");
		expect(workers[0].terminate).toHaveBeenCalledOnce();
		expect(getLocalChatStatus().state).toBe("error");
	});

	it("keeps an immediate retry alive while the cancelled request finishes cleanup", async () => {
		respond = false;
		const controller = new AbortController();
		const cancelled = collect(controller.signal);
		const rejected = expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
		await vi.waitFor(() => expect(workers).toHaveLength(1));
		controller.abort();
		const retry = collect();
		await rejected;
		await vi.waitFor(() => expect(workers).toHaveLength(2));
		expect(workers[1].terminate).not.toHaveBeenCalled();
		const { requestId } = workers[1].requests[0];
		workers[1].emit({ requestId, type: "delta", content: "Xin chào" });
		workers[1].emit({ requestId, type: "done" });
		await expect(retry).resolves.toEqual([{ type: "text", content: "Xin chào" }]);
	});

	it("times out stalled inference and releases GPU memory", async () => {
		vi.useFakeTimers();
		respond = false;
		const pending = collect();
		const rejected = expect(pending).rejects.toThrow("timed out");
		await vi.advanceTimersByTimeAsync(600_001);
		await rejected;
		expect(workers[0].terminate).toHaveBeenCalledOnce();
	});

	it("selects the full precision runtime on GPUs without shader-f16", async () => {
		Object.defineProperty(navigator, "gpu", {
			configurable: true,
			value: { requestAdapter: () => Promise.resolve({ features: new Set() }) },
		});
		await collect();
		expect(workers[0].requests[0].model).toBe(DEFAULT_CHAT_MODEL.replace("q4f16_1", "q4f32_1"));
	});

	it("reports missing WebGPU without creating a worker or calling a server", async () => {
		Object.defineProperty(navigator, "gpu", { configurable: true, value: undefined });
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		await expect(collect()).rejects.toThrow("needs WebGPU");
		expect(workers).toHaveLength(0);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("limits local history to recent complete exchanges and isolates translation directions", () => {
		const messages: Array<ChatRequest["messages"][number]> = Array.from(
			{ length: 21 },
			(_, index) => ({
				id: String(index),
				role: index % 2 === 0 ? "user" : "assistant",
				content: "Xin chào".repeat(50),
			}),
		);
		const recent = localHistory({ ...input, messages });
		expect(recent[0].role).toBe("user");
		expect(recent.at(-1)).toEqual(messages.at(-1));
		expect(
			recent.reduce((length, message) => length + message.content.length, 0),
		).toBeLessThanOrEqual(3500);
		expect(localHistory({ ...input, mode: "translate", messages })).toEqual([messages.at(-1)]);
	});
});

it("separates think tags at every possible chunk boundary", () => {
	const source = "<think>Vietnamese reasoning</think>Xin chào";
	for (let split = 1; split < source.length; split++) {
		const parser = new ReasoningParser();
		const deltas = [
			...parser.push(source.slice(0, split)),
			...parser.push(source.slice(split)),
			...parser.flush(),
		];
		expect(
			deltas
				.filter((delta) => delta.type === "thinking")
				.map((delta) => delta.content)
				.join(""),
		).toBe("Vietnamese reasoning");
		expect(
			deltas
				.filter((delta) => delta.type === "text")
				.map((delta) => delta.content)
				.join(""),
		).toBe("Xin chào");
	}
});

it("hides the runtime's empty thinking prefix when thinking is off", () => {
	const source = "<think>\n\n</think>\n\nXin chào";
	for (let split = 1; split < source.length; split++) {
		const parser = new ReasoningParser();
		const deltas = [
			...parser.push(source.slice(0, split)),
			...parser.push(source.slice(split)),
			...parser.flush(),
		];
		expect(deltas.some((delta) => delta.type === "thinking")).toBe(false);
		expect(deltas.map((delta) => delta.content).join("")).toBe("Xin chào");
	}
});
