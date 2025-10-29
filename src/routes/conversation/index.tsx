import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { SpeakButton } from "~/components/SpeakButton";
import { TypeInputButton } from "~/components/TypeInputButton";
import Header from "~/layout/Header";
import { useLLM } from "~/providers/llm-provider";
import type { Language } from "~/providers/tts-provider";
import {
	type Gender,
	generateTranslationPrompt,
	getAllGenders,
	getAllPersonTypes,
	getGenderLabel,
	getPersonTypeLabel,
	type PersonType,
	type TranslationDirection,
} from "./-prompts";

export const Route = createFileRoute("/conversation/")({
	component: ConversationRoute,
	// Disable SSR for this route since it uses Web Workers
	ssr: false,
});

interface TranslationMessage {
	id: string;
	speaker: "you" | "them";
	originalText: string;
	originalLang: Language;
	translatedText: string;
	translatedLang: Language;
	timestamp: Date;
	isTranslating?: boolean;
}

type ModelStatus = "idle" | "loading" | "ready" | "error";

// Module-level worker instance to survive Strict Mode
// We use a mount counter to only terminate the worker when all instances unmount.
let sharedWorker: Worker | null = null;
let workerMountCount = 0;

const GENDER_STORAGE_KEY = "conversation-user-gender";

function ConversationRoute() {
	const { selectedModel, thinkingEnabled } = useLLM();
	const [personType, setPersonType] = useState<PersonType>("friend");
	const [userGender, setUserGender] = useState<Gender>(() => {
		// Load saved gender from localStorage
		const saved = localStorage.getItem(GENDER_STORAGE_KEY);
		return (saved as Gender) || "male";
	});
	const [messages, setMessages] = useState<TranslationMessage[]>([]);
	const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [progressText, setProgressText] = useState("Initializing...");
	const [isTranslating, setIsTranslating] = useState(false);

	const worker = useRef<Worker | null>(null);
	const currentConfigRef = useRef<{
		modelId: string;
		thinkingEnabled: boolean;
	} | null>(null);
	const conversationHistory = useRef<
		Array<{ role: "user" | "assistant" | "system"; content: string }>
	>([]);
	const currentTranslationRef = useRef<{
		direction: TranslationDirection;
		originalText: string;
		originalLang: Language;
	} | null>(null);

	// Initialize worker - survive Strict Mode double-mount
	useEffect(() => {
		if (sharedWorker) {
			worker.current = sharedWorker;
		} else {
			worker.current = new Worker(
				new URL("../../workers/llm-worker.ts", import.meta.url),
				{ type: "module" },
			);
			sharedWorker = worker.current;
		}

		workerMountCount++;

		worker.current.onerror = (error) => {
			console.error("[Conversation] Worker error:", error);
			setModelStatus("error");
			setProgressText("Worker initialization failed");
		};

		worker.current.onmessage = (event) => {
			const message = event.data;

			switch (message.status) {
				case "progress":
					setModelStatus("loading");
					setLoadingProgress(Math.round((message.progress || 0) * 100));
					setProgressText(message.text || "Loading model...");
					break;

				case "ready":
					setModelStatus("ready");
					setLoadingProgress(0);
					setProgressText("");
					break;

				case "stream":
					// Update the last message with streaming translation
					setMessages((prev) => {
						if (prev.length === 0) return prev;

						const lastMsg = prev[0]; // Newest is at top
						if (lastMsg?.isTranslating) {
							return [
								{
									...lastMsg,
									translatedText: message.text,
									isTranslating: !message.isComplete,
								},
								...prev.slice(1),
							];
						}
						return prev;
					});

					if (message.isComplete) {
						setIsTranslating(false);
						// Add assistant's translation to conversation history
						conversationHistory.current.push({
							role: "assistant",
							content: message.text,
						});
						currentTranslationRef.current = null;
					}
					break;

				case "error":
					console.error("Translation error:", message.error);
					setModelStatus("error");
					setProgressText(message.error);
					setIsTranslating(false);
					currentTranslationRef.current = null;
					break;
			}
		};

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

		const configChanged =
			!currentConfigRef.current ||
			currentConfigRef.current.modelId !== newConfig.modelId ||
			currentConfigRef.current.thinkingEnabled !== newConfig.thinkingEnabled;

		if (configChanged) {
			// Always abort before model reload to prevent WebGPU conflicts
			// Worker handles this safely even if nothing is running
			worker.current.postMessage({ type: "abort" });

			currentConfigRef.current = newConfig;
			setModelStatus("loading");
			setIsTranslating(false);
			currentTranslationRef.current = null;
			worker.current.postMessage({
				type: "init",
				config: newConfig,
			});
		}
	}, [selectedModel, thinkingEnabled]);

	// Handle gender change
	const handleGenderChange = (newGender: Gender) => {
		setUserGender(newGender);
		localStorage.setItem(GENDER_STORAGE_KEY, newGender);
		// Note: Don't clear messages on gender change - it's just a pronoun adjustment
	};

	// Clear messages when person type changes (different context)
	const handlePersonTypeChange = (newType: PersonType) => {
		// Abort any ongoing translation first to prevent race conditions
		if (isTranslating && worker.current) {
			worker.current.postMessage({ type: "abort" });
		}

		setPersonType(newType);
		setMessages([]);
		setIsTranslating(false);
		conversationHistory.current = [];
		currentTranslationRef.current = null;

		if (worker.current) {
			worker.current.postMessage({ type: "reset" });
		}
	};

	// Reset conversation
	const resetConversation = () => {
		// Abort any ongoing translation first to prevent race conditions
		if (isTranslating && worker.current) {
			worker.current.postMessage({ type: "abort" });
		}

		setMessages([]);
		setIsTranslating(false);
		conversationHistory.current = [];
		currentTranslationRef.current = null;

		if (worker.current) {
			worker.current.postMessage({ type: "reset" });
		}
	};

	const handleTranscription = useCallback(
		(text: string, speaker: "you" | "them") => {
			if (!worker.current || isTranslating) {
				return;
			}

			const direction: TranslationDirection =
				speaker === "you" ? "en-to-vi" : "vi-to-en";
			const originalLang: Language = speaker === "you" ? "en" : "vn";
			const translatedLang: Language = speaker === "you" ? "vn" : "en";

			// Create message with empty translation (will be filled by streaming)
			const newMessage: TranslationMessage = {
				id: crypto.randomUUID(),
				speaker,
				originalText: text,
				originalLang,
				translatedText: "",
				translatedLang,
				timestamp: new Date(),
				isTranslating: true,
			};

			// Add to top (newest first)
			setMessages((prev) => [newMessage, ...prev]);
			setIsTranslating(true);
			currentTranslationRef.current = {
				direction,
				originalText: text,
				originalLang,
			};

			// Build conversation with system prompt for this translation
			const systemPrompt = generateTranslationPrompt(
				personType,
				direction,
				userGender,
			);

			// Add user's original text to conversation history
			conversationHistory.current.push({
				role: "user",
				content: text,
			});

			// Send to LLM for translation
			worker.current.postMessage({
				type: "generate",
				messages: [
					{ role: "system", content: systemPrompt },
					...conversationHistory.current,
				],
			});
		},
		[personType, isTranslating, userGender],
	);

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header>
				{messages.length !== 0 && (
					<Button
						variant="outline"
						size="medium"
						onClick={resetConversation}
						className="gap-2"
						title="Reset conversation"
					>
						<RefreshCw className="mr-2 inline-block h-5 w-5" />
						<span className="font-serif text-lg">Reset</span>
					</Button>
				)}
			</Header>

			{/* Microphone Controls */}
			<div className="mx-auto w-full max-w-4xl px-6 pt-6">
				<div className="grid grid-cols-2 gap-6">
					{/* You (English → Vietnamese) */}
					<div className="flex flex-col items-center gap-3">
						<div className="flex flex-col items-center text-center">
							<select
								value={userGender}
								onChange={(e) => handleGenderChange(e.target.value as Gender)}
								className="h-10 rounded-xl border-2 border-gold/30 bg-burgundy-dark px-4 py-0 font-semibold font-serif text-lg text-warm-cream transition-colors focus:border-gold focus:outline-none"
								disabled={isTranslating}
							>
								{getAllGenders().map((gender) => (
									<option key={gender} value={gender}>
										{getGenderLabel(gender)}
									</option>
								))}
							</select>
							<p className="mt-1 font-serif text-sm text-warm-cream/70">
								English
							</p>
						</div>
						<div className="flex items-center gap-3">
							<ListenButton
								onTranscription={(text) => handleTranscription(text, "you")}
								lang="en"
								size="large"
								disabled={modelStatus !== "ready"}
							/>
							<TypeInputButton
								onSubmit={(text) => handleTranscription(text, "you")}
								size="large"
								disabled={modelStatus !== "ready"}
								placeholder="Type in English..."
							/>
						</div>
					</div>

					{/* Them (Vietnamese → English) */}
					<div className="flex flex-col items-center gap-3">
						<div className="flex flex-col items-center text-center">
							<select
								value={personType}
								onChange={(e) =>
									handlePersonTypeChange(e.target.value as PersonType)
								}
								className="h-10 rounded-xl border-2 border-gold/30 bg-burgundy-dark px-4 py-0 font-semibold font-serif text-lg text-warm-cream transition-colors focus:border-gold focus:outline-none"
								disabled={isTranslating}
							>
								{getAllPersonTypes().map((type) => (
									<option key={type} value={type}>
										{getPersonTypeLabel(type)}
									</option>
								))}
							</select>
							<p className="mt-1 font-serif text-sm text-warm-cream/70">
								Vietnamese
							</p>
						</div>
						<ListenButton
							onTranscription={(text) => handleTranscription(text, "them")}
							lang="vn"
							size="large"
							disabled={modelStatus !== "ready"}
						/>
					</div>
				</div>
			</div>

			{/* Status Message */}
			{modelStatus !== "ready" && (
				<div className="mx-auto w-full max-w-4xl px-6 pt-6">
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
								{modelStatus === "loading"
									? `Loading ${selectedModel.name}... ${loadingProgress}%`
									: "Initializing..."}
							</p>
						)}
					</div>
				</div>
			)}

			{/* Messages - newest on top */}
			<div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-6 py-6">
				<div className="space-y-3">
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex ${msg.speaker === "you" ? "justify-start" : "justify-end"}`}
						>
							<div
								className={`max-w-[85%] rounded-xl border-2 border-gold/30 bg-burgundy-dark/80 px-4 py-2.5`}
							>
								{/* Original text (always shown, smaller) */}
								<p className="mb-1.5 font-serif text-warm-cream/60 text-xs leading-relaxed">
									{msg.originalText}
								</p>

								{/* Translation or loading state */}
								{msg.isTranslating ? (
									<p className="font-serif text-sm text-warm-cream/50 italic">
										{msg.translatedLang === "vn"
											? "Translating..."
											: "Đang dịch..."}
									</p>
								) : (
									<div className="flex items-center gap-2">
										{/* Translation (main display) */}
										<p className="flex-1 font-serif text-base text-warm-cream leading-relaxed">
											{msg.translatedText}
										</p>

										{/* Speak button */}
										{msg.translatedText && (
											<SpeakButton
												text={msg.translatedText}
												lang={msg.translatedLang}
												size="small"
												className="flex-shrink-0"
											/>
										)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
