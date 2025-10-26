import { createFileRoute } from "@tanstack/react-router";
import { Bot, RefreshCw } from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button } from "~/components/Button";
import { Popover } from "~/components/Popover";
import {
	type SendButtonState,
	SendMessageButton,
} from "~/components/SendMessageButton";
import Header from "~/layout/Header";
import { useLLM } from "~/providers/llm-provider";

export const Route = createFileRoute("/chat")({
	component: ChatRoute,
	// Disable SSR for this route since it uses Web Workers and WebGPU
	ssr: false,
});

const CHAT_SYSTEM_PROMPT = `You are a Vietnamese conversation partner. Your role is to help practice conversational Vietnamese through natural dialogue.

Guidelines:
- Respond primarily in Vietnamese with brief English translations when needed
- Correct mistakes naturally, as a native speaker would
- Keep responses conversational and practical
- Match the user's proficiency level
- Stay concise and engaging

Focus on conversation practice, not teaching lectures.`;

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	thinking?: string;
	isThinking?: boolean; // True while AI is actively thinking
	timestamp: Date;
}

type ModelStatus = "idle" | "loading" | "ready" | "error";

// Module-level worker instance to survive Strict Mode double-mount
// IMPORTANT: React Strict Mode in development mounts components twice (mount -> unmount -> mount).
// Using a ref alone doesn't work because refs are reset between mounts.
// This module-level variable persists across the unmount/remount cycle, preventing:
// 1. Creating duplicate workers (which orphans the first worker during model loading)
// 2. Lost message handlers (second mount would create new worker without seeing first worker's messages)
// We use a mount counter to only terminate the worker when all instances unmount.
let sharedWorker: Worker | null = null;
// eslint-disable-next-line prefer-const
let workerMountCount = 0;

function ChatRoute() {
	const { selectedModel, thinkingEnabled } = useLLM();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [progressText, setProgressText] = useState("Initializing...");
	const [isGenerating, setIsGenerating] = useState(false);

	const worker = useRef<Worker | null>(null);
	const currentConfigRef = useRef<{
		modelId: string;
		thinkingEnabled: boolean;
	} | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const pendingMessageRef = useRef<Message | null>(null);
	const messagesRef = useRef<Message[]>(messages);

	// Keep messagesRef in sync with messages state
	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	// Auto-scroll to bottom when new messages arrive (not during streaming updates)
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Initialize worker - survive Strict Mode but cleanup properly
	// CRITICAL: React Strict Mode in development causes components to mount/unmount/remount.
	// This would normally create two workers, orphaning the first one that's loading the model.
	// Solution: Store worker in module-level `sharedWorker` variable that survives remounts.
	// On first mount: Create worker and store in both `worker.current` and `sharedWorker`
	// On second mount (Strict Mode): Restore `worker.current` from `sharedWorker`
	useEffect(() => {
		// Restore shared worker instance on remount (Strict Mode)
		if (sharedWorker) {
			worker.current = sharedWorker;
		} else {
			// First mount: create new worker
			worker.current = new Worker(
				new URL("../workers/llm-worker.ts", import.meta.url),
				{ type: "module" },
			);
			sharedWorker = worker.current;
		}

		workerMountCount++;

		worker.current.onerror = (error) => {
			console.error("[Chat] Worker error:", error);
			setModelStatus("error");
			setProgressText("Worker initialization failed");
		};

		worker.current.onmessage = (event) => {
			const message = event.data;

			switch (message.status) {
				case "progress":
					setModelStatus("loading");
					// Convert progress from decimal (0.0-1.0) to percentage (0-100)
					setLoadingProgress(Math.round((message.progress || 0) * 100));
					setProgressText(message.text || "Loading model...");
					break;

				case "ready":
					setModelStatus("ready");
					setLoadingProgress(0);
					setProgressText("");
					// Process pending message if exists
					if (pendingMessageRef.current && worker.current) {
						pendingMessageRef.current = null;
						setIsGenerating(true);

						// Build conversation from current messages
						// Note: messagesRef is fresh here (includes pending message),
						// so we DON'T append it again
						const conversationMessages = [
							{ role: "system" as const, content: CHAT_SYSTEM_PROMPT },
							...messagesRef.current.map((msg) => ({
								role: msg.role,
								content: msg.content,
							})),
						];

						worker.current.postMessage({
							type: "generate",
							messages: conversationMessages,
						});
					}
					break;

				case "stream":
					// Update the last assistant message with streaming content
					setMessages((prev) => {
						// Ignore in-flight messages if chat was reset
						if (prev.length === 0) {
							return prev;
						}

						const lastMsg = prev[prev.length - 1];
						if (lastMsg?.role === "assistant") {
							return [
								...prev.slice(0, -1),
								{
									...lastMsg,
									content: message.text,
									thinking: message.thinking,
									isThinking: message.isThinking,
								},
							];
						}
						// First chunk - create new assistant message
						return [
							...prev,
							{
								id: crypto.randomUUID(),
								role: "assistant" as const,
								content: message.text,
								thinking: message.thinking,
								isThinking: message.isThinking,
								timestamp: new Date(),
							},
						];
					});

					if (message.isComplete) {
						setIsGenerating(false);
					}
					break;

				case "error":
					console.error("LLM error:", message.error);
					setModelStatus("error");
					setProgressText(message.error);
					setIsGenerating(false);
					// Clear pending message on error
					pendingMessageRef.current = null;
					break;
			}
		};

		// Cleanup: Terminate worker and reset shared reference
		// This runs on actual component unmount (navigation away from route)
		return () => {
			workerMountCount--;

			// In production: cleanup immediately (no Strict Mode)
			// In development: use setTimeout to handle Strict Mode double-mount
			const cleanupDelay = import.meta.env.DEV ? 100 : 0;

			setTimeout(() => {
				if (workerMountCount === 0 && sharedWorker) {
					sharedWorker.terminate();
					sharedWorker = null;
					worker.current = null;
				}
			}, cleanupDelay);
		};
	}, []);

	// Initialize model when selectedModel or thinkingEnabled changes
	useEffect(() => {
		if (!worker.current) return;

		const newConfig = {
			modelId: selectedModel.modelId,
			thinkingEnabled,
		};

		// Check if config actually changed
		const configChanged =
			!currentConfigRef.current ||
			currentConfigRef.current.modelId !== newConfig.modelId ||
			currentConfigRef.current.thinkingEnabled !== newConfig.thinkingEnabled;

		if (configChanged) {
			currentConfigRef.current = newConfig;
			setModelStatus("loading");
			setIsGenerating(false);
			// Clear pending message when switching models - don't want to send to wrong model
			pendingMessageRef.current = null;
			worker.current.postMessage({
				type: "init",
				config: newConfig,
			});
		}
	}, [selectedModel, thinkingEnabled]);

	const sendMessage = useCallback(() => {
		if (!input.trim() || !worker.current || isGenerating) {
			return;
		}

		// Add user message
		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: input.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");

		// If model is not ready, queue the message
		if (modelStatus !== "ready") {
			pendingMessageRef.current = userMessage;
			return;
		}

		setIsGenerating(true);

		// Build conversation with system prompt
		// Note: messagesRef is stale here (doesn't include userMessage yet),
		// so we append userMessage explicitly
		const conversationMessages = [
			{ role: "system" as const, content: CHAT_SYSTEM_PROMPT },
			...messagesRef.current.map((msg) => ({
				role: msg.role,
				content: msg.content,
			})),
			{ role: userMessage.role, content: userMessage.content },
		];

		worker.current.postMessage({
			type: "generate",
			messages: conversationMessages,
		});
	}, [input, modelStatus, isGenerating]);

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const stopGeneration = () => {
		if (worker.current && isGenerating) {
			worker.current.postMessage({ type: "abort" });
			setIsGenerating(false);
		}
	};

	const resetChat = () => {
		setMessages([]);
		setInput("");
		setIsGenerating(false);
		pendingMessageRef.current = null;
		if (worker.current) {
			worker.current.postMessage({ type: "reset" });
		}
	};

	// Determine send button state
	const getSendButtonState = (): SendButtonState => {
		if (modelStatus === "loading") return "loading";
		if (isGenerating) return "generating";
		return "idle";
	};

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header>
				{messages.length !== 0 && (
					<Button
						variant="outline"
						size="medium"
						onClick={resetChat}
						className="gap-2"
						title="Reset conversation"
					>
						<RefreshCw className="mr-2 inline-block h-5 w-5" />
						<span className="font-serif text-lg">Reset</span>
					</Button>
				)}
			</Header>

			{/* Messages */}
			<div className="mx-auto mb-4 flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-6">
				<div className="flex-1 space-y-3 overflow-y-auto p-6">
					{messages.length === 0 && (
						<div className="flex h-full items-center justify-center">
							<div className="text-center">
								{modelStatus === "error" ? (
									<>
										<p className="mb-2 font-serif text-red-400">
											Error loading model
										</p>
										<p className="font-serif text-sm text-warm-cream/70">
											{progressText}
										</p>
									</>
								) : (
									<p className="font-serif text-warm-cream/50">
										{modelStatus === "ready" ? (
											<>
												Ready to chat.
												<br />
												NOTE: AI can make mistakes. Verify what matters.
											</>
										) : modelStatus === "loading" ? (
											`Loading ${selectedModel.name}...`
										) : (
											"Initializing..."
										)}
									</p>
								)}
							</div>
						</div>
					)}

					{messages.map((msg) => {
						// Determine what to display
						const isActivelyThinking =
							msg.role === "assistant" && msg.isThinking;
						const hasCompletedThinking =
							msg.role === "assistant" && msg.thinking && !msg.isThinking;
						const displayContent = isActivelyThinking ? "" : msg.content;

						return (
							<div
								key={msg.id}
								className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[75%] rounded-xl border-2 px-4 py-2.5 ${
										msg.role === "user"
											? "border-gold/30 bg-burgundy-dark/80 text-warm-cream"
											: "border-gold/30 bg-burgundy-dark/80 text-warm-cream"
									}`}
								>
									{isActivelyThinking ? (
										// Show thinking indicator with clickable popover
										<Popover
											trigger={
												<div className="flex cursor-pointer items-center gap-2">
													<Bot className="h-4 w-4 animate-pulse text-gold" />
													<span className="font-serif text-sm text-warm-cream/70 italic">
														Thinking...
													</span>
												</div>
											}
											className="max-w-md"
											buttonClassName="w-full rounded-md hover:bg-gold/10"
										>
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Bot className="h-4 w-4 text-gold" />
													<h3 className="font-semibold font-serif text-gold text-sm">
														Reasoning Process
													</h3>
												</div>
												<p className="whitespace-pre-wrap font-serif text-sm text-warm-cream leading-relaxed">
													{msg.thinking || "Processing..."}
												</p>
											</div>
										</Popover>
									) : (
										<>
											{hasCompletedThinking && (
												<div className="mb-2 flex justify-start">
													<Popover
														trigger={
															<Bot className="h-4 w-4 text-gold/70 hover:text-gold" />
														}
														className="max-w-md"
														buttonClassName="rounded-md p-1 hover:bg-gold/10"
													>
														<div className="space-y-2">
															<div className="flex items-center gap-2">
																<Bot className="h-4 w-4 text-gold" />
																<h3 className="font-semibold font-serif text-gold text-sm">
																	Reasoning Process
																</h3>
															</div>
															<p className="whitespace-pre-wrap font-serif text-sm text-warm-cream leading-relaxed">
																{msg.thinking}
															</p>
														</div>
													</Popover>
												</div>
											)}
											<p className="whitespace-pre-wrap font-serif text-base leading-relaxed">
												{displayContent}
											</p>
										</>
									)}
								</div>
							</div>
						);
					})}

					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input Area */}
			<div className="mx-auto w-full max-w-4xl px-6 pb-6">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
							disabled={isGenerating}
							rows={2}
							className="max-h-32 w-full resize-none rounded-2xl border-2 border-gold/30 bg-burgundy-dark px-4 py-3 font-serif text-warm-cream placeholder-warm-cream/50 transition-colors focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<SendMessageButton
						state={getSendButtonState()}
						onSend={sendMessage}
						onStop={stopGeneration}
						disabled={!input.trim()}
						loadingProgress={loadingProgress}
						size="medium"
					/>
				</div>
			</div>
		</div>
	);
}
