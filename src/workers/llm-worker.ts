import * as webllm from "@mlc-ai/web-llm";

// Inline sleep to avoid import issues in worker
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Configuration interface
interface LLMConfig {
	modelId: string;
	thinkingEnabled: boolean;
}

// Message types
interface InitMessage {
	type: "init";
	config: LLMConfig;
}

interface GenerateMessage {
	type: "generate";
	messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}

interface ResetMessage {
	type: "reset";
}

interface AbortMessage {
	type: "abort";
}

type WorkerMessage =
	| InitMessage
	| GenerateMessage
	| ResetMessage
	| AbortMessage;

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
let currentConfig: LLMConfig | null = null;
let isGenerating = false;
let abortController: AbortController | null = null;

// Initialize the model
async function initModel(config: LLMConfig) {
	try {
		// If model is already loaded with the same config, skip
		if (
			engine &&
			currentConfig &&
			currentConfig.modelId === config.modelId &&
			currentConfig.thinkingEnabled === config.thinkingEnabled
		) {
			self.postMessage({ status: "ready" } as ReadyResponse);
			return;
		}

		// If only thinking mode changed but same model, update config and skip reload
		if (
			engine &&
			currentConfig &&
			currentConfig.modelId === config.modelId &&
			currentConfig.thinkingEnabled !== config.thinkingEnabled
		) {
			currentConfig = config;
			self.postMessage({ status: "ready" } as ReadyResponse);
			return;
		}

		// Model changed - need full reload
		// Stop any ongoing generation
		if (isGenerating) {
			abortController?.abort();
			isGenerating = false;
		}

		// Dispose of old model if exists
		if (engine) {
			await engine.unload();
			engine = null;
			currentConfig = null;

			await sleep(500);
		}

		currentConfig = config;

		// Check WebGPU support
		if (!navigator.gpu) {
			throw new Error("WebGPU is not supported in this browser");
		}

		// Load new model with progress tracking
		engine = await webllm.CreateMLCEngine(config.modelId, {
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
		currentConfig = null;
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
	if (!engine || !currentConfig) {
		throw new Error("Model not initialized");
	}

	isGenerating = true;
	abortController = new AbortController();

	try {
		// Build generation options based on thinking mode
		// Thinking mode uses longer token limits to accommodate reasoning
		const maxTokens = currentConfig.thinkingEnabled ? 2048 : 512;

		const chunks = await engine.chat.completions.create({
			messages,
			temperature: 0.7,
			max_tokens: maxTokens,
			stream: true,
			extra_body: {
				enable_thinking: currentConfig.thinkingEnabled,
			},
		});

		let fullText = "";

		for await (const chunk of chunks) {
			// Check if generation was cancelled (abort or model switch)
			if (!isGenerating || abortController?.signal.aborted) {
				return;
			}

			const delta = chunk.choices[0]?.delta?.content || "";
			if (delta) {
				fullText += delta;

				// Always parse to strip thinking tags (defense in depth)
				const { thinking, message, isThinking } =
					parseThinkingContent(fullText);

				// Only expose thinking content if thinking mode is enabled
				self.postMessage({
					status: "stream",
					text: message,
					thinking: currentConfig.thinkingEnabled
						? thinking || undefined
						: undefined,
					isThinking: currentConfig.thinkingEnabled ? isThinking : false,
					isComplete: false,
				} as StreamResponse);
			}
		}

		// Check again before sending final message
		if (!isGenerating || abortController?.signal.aborted) {
			return;
		}

		// Send final message - always parse to strip thinking tags
		const { thinking, message, isThinking } = parseThinkingContent(fullText);

		// If thinking tag never closed, treat entire response as normal message
		const finalMessage = isThinking
			? fullText.replace(/^<think(?:ing)?>/i, "").trim()
			: message;

		self.postMessage({
			status: "stream",
			text: finalMessage,
			thinking:
				currentConfig.thinkingEnabled && !isThinking
					? thinking || undefined
					: undefined,
			isThinking: false, // Always false on completion
			isComplete: true,
		} as StreamResponse);
	} finally {
		isGenerating = false;
		abortController = null;
	}
}

// Abort generation
function abortGeneration() {
	if (isGenerating && abortController) {
		abortController.abort();
		isGenerating = false;
		abortController = null;
	}
}

// Reset conversation
async function resetConversation() {
	// Cancel any ongoing generation
	abortGeneration();
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
				await initModel(message.config);
				break;

			case "generate":
				await generateResponse(message.messages);
				break;

			case "reset":
				await resetConversation();
				break;

			case "abort":
				abortGeneration();
				self.postMessage({ status: "ready" } as ReadyResponse);
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
