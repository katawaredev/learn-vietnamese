import * as webllm from "@mlc-ai/web-llm";
import { sleep } from "~/utils/lib";

// Message types
interface InitMessage {
	type: "init";
	modelId: string;
}

interface GenerateMessage {
	type: "generate";
	messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}

interface ResetMessage {
	type: "reset";
}

type WorkerMessage = InitMessage | GenerateMessage | ResetMessage;

// Response types
interface ProgressResponse {
	status: "progress";
	progress: number;
	text: string;
}

interface ReadyResponse {
	status: "ready";
}

interface StreamResponse {
	status: "stream";
	text: string;
	thinking?: string;
	isThinking: boolean; // True while thinking tag is open
	isComplete: boolean;
}

interface ErrorResponse {
	status: "error";
	error: string;
}

// Model instance
let engine: webllm.MLCEngine | null = null;
let currentModelId: string | null = null;
let isGenerating = false;

// Initialize the model
async function initModel(modelId: string) {
	try {
		// If model is already loaded with the same ID, skip
		if (engine && currentModelId === modelId) {
			self.postMessage({ status: "ready" } as ReadyResponse);
			return;
		}

		// Stop any ongoing generation
		if (isGenerating) {
			isGenerating = false;
		}

		// Dispose of old model if exists
		if (engine) {
			await engine.unload();
			engine = null;
			currentModelId = null;

			await sleep(500);
		}

		currentModelId = modelId;

		// Check WebGPU support
		if (!navigator.gpu) {
			throw new Error("WebGPU is not supported in this browser");
		}

		// Load new model with progress tracking
		engine = await webllm.CreateMLCEngine(modelId, {
			initProgressCallback: (report: webllm.InitProgressReport) => {
				self.postMessage({
					status: "progress",
					progress: report.progress || 0,
					text: report.text || "Loading model...",
				} as ProgressResponse);
			},
			logLevel: "ERROR",
		});

		self.postMessage({ status: "ready" } as ReadyResponse);
	} catch (error) {
		console.error("[LLM Worker] Init error:", error);
		throw error;
	}
}

// Helper function to extract thinking and message content
function parseThinkingContent(text: string): {
	thinking: string;
	message: string;
	isThinking: boolean;
} {
	// Check if text starts with opening tag
	const startsWithThink = /^<think(?:ing)?>/i.test(text);

	if (!startsWithThink) {
		// No thinking tags - return everything as message
		return { thinking: "", message: text, isThinking: false };
	}

	// Match completed <think>...</think> or <thinking>...</thinking>
	const thinkMatch = text.match(/^<think>([\s\S]*?)<\/think>/i);
	const thinkingMatch = text.match(/^<thinking>([\s\S]*?)<\/thinking>/i);
	const match = thinkMatch || thinkingMatch;

	if (match) {
		// Thinking tag is closed
		const thinking = match[1].trim();
		const message = text.slice(match[0].length).trim();
		return { thinking, message, isThinking: false };
	}

	// Thinking tag is open (no closing tag yet)
	const openThinkMatch = text.match(/^<think(?:ing)?>([\s\S]*)/i);
	if (openThinkMatch) {
		const thinking = openThinkMatch[1].trim();
		return { thinking, message: "", isThinking: true };
	}

	// Fallback: treat as normal message
	return { thinking: "", message: text, isThinking: false };
}

// Generate response with streaming
async function generateResponse(
	messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
) {
	if (!engine) {
		throw new Error("Model not initialized");
	}

	isGenerating = true;

	try {
		const chunks = await engine.chat.completions.create({
			messages,
			temperature: 0.7,
			max_tokens: 512,
			stream: true,
		});

		let fullText = "";

		for await (const chunk of chunks) {
			// Check if generation was cancelled (e.g., model switch)
			if (!isGenerating) {
				return;
			}

			const delta = chunk.choices[0]?.delta?.content || "";
			if (delta) {
				fullText += delta;
				// Parse thinking and message content
				const { thinking, message, isThinking } =
					parseThinkingContent(fullText);
				self.postMessage({
					status: "stream",
					text: message,
					thinking: thinking || undefined,
					isThinking,
					isComplete: false,
				} as StreamResponse);
			}
		}

		// Check again before sending final message
		if (!isGenerating) {
			return;
		}

		// Send final message
		const { thinking, message, isThinking } = parseThinkingContent(fullText);

		// If thinking tag never closed, treat entire response as normal message
		const finalMessage = isThinking
			? fullText.replace(/^<think(?:ing)?>/i, "").trim()
			: message;

		self.postMessage({
			status: "stream",
			text: finalMessage,
			thinking: isThinking ? undefined : thinking || undefined,
			isThinking: false, // Always false on completion
			isComplete: true,
		} as StreamResponse);
	} finally {
		isGenerating = false;
	}
}

// Reset conversation
async function resetConversation() {
	// Cancel any ongoing generation
	isGenerating = false;
	if (engine) {
		await engine.resetChat();
		self.postMessage({ status: "ready" } as ReadyResponse);
	}
}

// Message handler
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
	const message = event.data;

	try {
		switch (message.type) {
			case "init":
				await initModel(message.modelId);
				break;

			case "generate":
				await generateResponse(message.messages);
				break;

			case "reset":
				await resetConversation();
				break;
		}
	} catch (error) {
		console.error("[Worker] Error:", error);
		self.postMessage({
			status: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		} as ErrorResponse);
	}
});
