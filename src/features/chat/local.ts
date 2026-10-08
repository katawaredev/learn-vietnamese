import { Schema } from "effect";
import type { ChatRequest } from "./contracts";
import { findBrowserChatModel } from "./catalog";
import { LocalChatEvent } from "./local-contracts";
import { ReasoningParser, type ChatDelta } from "./reasoning";

export interface LocalChatStatus {
	state: "idle" | "loading" | "ready" | "working" | "error";
	message?: string;
}
const IDLE: LocalChatStatus = { state: "idle" };
let status = IDLE;
const listeners = new Set<() => void>();
export const getLocalChatStatus = () => status;
export const getServerChatStatus = () => IDLE;
export const subscribeLocalChat = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
function publish(value: LocalChatStatus) {
	status = value;
	for (const listener of listeners) listener();
}

let session: { model: string; runtimeModel: string; worker: Worker } | undefined;
export function releaseLocalChat() {
	session?.worker.terminate();
	session = undefined;
	publish(IDLE);
}

export function localHistory(input: ChatRequest) {
	const latest = input.messages.at(-1);
	if (!latest || latest.role !== "user" || !latest.content.trim())
		throw new Error("Enter a message to start a conversation.");
	if (latest.content.length > 3500)
		throw new Error("Please shorten this message to 3,500 characters for local chat.");
	if (input.mode === "translate") return [latest];
	let size = 0;
	const recent: Array<ChatRequest["messages"][number]> = [];
	for (const message of input.messages.toReversed()) {
		if (size + message.content.length > 3500 || recent.length >= 9) break;
		recent.unshift(message);
		size += message.content.length;
	}
	while (recent[0]?.role !== "user") recent.shift();
	return recent;
}

async function workerForModel(model: string, signal: AbortSignal) {
	signal.throwIfAborted();
	if (!findBrowserChatModel(model))
		throw new Error("Choose an available local conversation model.");
	if (session?.model === model) return session;
	releaseLocalChat();
	publish({ state: "loading", message: "Preparing local conversation model…" });
	const gpu = (
		navigator as Navigator & {
			gpu?: { requestAdapter(): Promise<{ features: ReadonlySet<string> } | null> };
		}
	).gpu;
	const adapter = gpu ? await gpu.requestAdapter() : null;
	signal.throwIfAborted();
	if (!adapter)
		throw new Error(
			"Local chat needs WebGPU. Try a browser with WebGPU enabled or choose a configured server model in AI settings.",
		);
	const worker = new Worker(new URL("./local.worker.ts", import.meta.url), { type: "module" });
	session = {
		model,
		runtimeModel: adapter.features.has("shader-f16") ? model : model.replace("q4f16_1", "q4f32_1"),
		worker,
	};
	return session;
}

export async function* generateLocalChat(
	input: ChatRequest,
	signal: AbortSignal,
): AsyncGenerator<ChatDelta> {
	const messages = localHistory(input);
	const controller = new AbortController();
	const operationSignal = AbortSignal.any([signal, controller.signal]);
	const timeout = setTimeout(
		() =>
			controller.abort(
				new Error("Local chat timed out. Try a smaller model or a configured local server."),
			),
		10 * 60_000,
	);
	let wake: (() => void) | undefined;
	const abort = () => {
		releaseLocalChat();
		wake?.();
	};
	operationSignal.addEventListener("abort", abort, { once: true });
	let worker: Worker | undefined;
	try {
		const current = await workerForModel(input.model ?? "", operationSignal);
		worker = current.worker;
		const requestId = crypto.randomUUID();
		const queue: LocalChatEvent[] = [];
		const enqueue = (event: LocalChatEvent) => {
			queue.push(event);
			wake?.();
		};
		worker.onmessage = (event: MessageEvent<unknown>) => {
			try {
				const value = Schema.decodeUnknownSync(LocalChatEvent)(event.data);
				if (value.requestId === requestId) enqueue(value);
			} catch {
				enqueue({
					requestId,
					type: "error",
					message: "The local model returned an invalid response.",
				});
			}
		};
		worker.onerror = () =>
			enqueue({
				requestId,
				type: "error",
				message: "The local chat worker stopped. Try again or choose a smaller model.",
			});
		worker.postMessage({ requestId, model: current.runtimeModel, input: { ...input, messages } });
		const parser = new ReasoningParser();
		let hasAnswer = false;
		let done = false;
		while (!done) {
			operationSignal.throwIfAborted();
			if (!queue.length) {
				// A worker event or cancellation wakes the consumer; no polling.
				// oxlint-disable-next-line no-await-in-loop
				await new Promise<void>((resolve) => {
					wake = resolve;
				});
				wake = undefined;
				continue;
			}
			const event = queue.shift();
			if (!event) continue;
			if (event.type === "error") throw new Error(event.message);
			if (event.type === "status") publish({ state: event.state, message: event.message });
			if (event.type === "done") done = true;
			for (const delta of event.type === "delta"
				? parser.push(event.content)
				: done
					? parser.flush()
					: []) {
				if (delta.type === "text" && delta.content.trim()) hasAnswer = true;
				yield delta;
			}
		}
		if (!hasAnswer)
			throw new Error(
				"The model finished without an answer. Turn off thinking or try a larger model.",
			);
		publish({ state: "ready", message: "Conversation model ready on this device." });
	} catch (reason) {
		releaseLocalChat();
		if (!signal.aborted)
			publish({
				state: "error",
				message:
					reason instanceof Error
						? reason.message
						: "Local chat failed. Try again or choose a smaller model.",
			});
		throw reason;
	} finally {
		clearTimeout(timeout);
		operationSignal.removeEventListener("abort", abort);
		if (worker) {
			worker.onmessage = null;
			worker.onerror = null;
		}
	}
}
