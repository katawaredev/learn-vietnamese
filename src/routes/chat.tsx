import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { SendMessageButton } from "~/components/SendMessageButton";
import { SpeakButton } from "~/components/SpeakButton";
import { AISettings, ConversationStatus } from "~/features/chat/settings";
import { useConversation } from "~/features/chat/use-conversation";
import Header from "~/layout/Header";

export const Route = createFileRoute("/chat")({ component: ChatRoute });

function ChatRoute() {
	const conversation = useConversation("practice");
	const { messages, sendMessage, isLoading, error, stop, clear, available } = conversation;
	const [input, setInput] = useState("");
	const end = useRef<HTMLDivElement>(null);
	useEffect(() => {
		end.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);
	const send = (text: string | null) => {
		if (!text?.trim() || isLoading || !available) return;
		setInput("");
		void sendMessage(text.trim()).catch(() => {
			/* TanStack AI exposes request failures through error. */
		});
	};
	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-burgundy-dark to-burgundy">
			<Header>
				<div className="flex items-center gap-3">
					<AISettings conversation={conversation} />
					<Button
						variant="outline"
						size="medium"
						onClick={() => {
							stop();
							clear();
							setInput("");
						}}
						disabled={!messages.length}
					>
						<RefreshCw className="mr-2 h-5 w-5" /> Reset
					</Button>
				</div>
			</Header>
			<ConversationStatus conversation={conversation} />
			<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 pb-6">
				{!available && (
					<output className="text-center font-serif text-warm-cream/70">
						{conversation.unavailableMessage}
					</output>
				)}
				{messages.length === 0 && available && (
					<p className="text-center font-serif text-warm-cream/70">
						Start a conversation in Vietnamese. You can type or use the microphone.
					</p>
				)}
				<div className="flex-1 space-y-3" aria-live="polite" aria-label="Conversation">
					{messages.map((message) => {
						const text = message.parts
							.filter((part) => part.type === "text")
							.map((part) => part.content)
							.join("\n");
						return (
							<article
								key={message.id}
								className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div className="max-w-[85%] rounded-xl border-2 border-gold/30 bg-burgundy-dark/80 px-4 py-3 text-warm-cream">
									<p className="mb-1 font-serif text-xs text-gold">
										{message.role === "user" ? "You" : "Conversation partner"}
									</p>
									{message.parts.some((part) => part.type === "thinking") && (
										<details className="mb-2 font-serif text-sm text-warm-cream/70">
											<summary>Thinking</summary>
											<p className="whitespace-pre-wrap">
												{message.parts
													.filter((part) => part.type === "thinking")
													.map((part) => part.content)
													.join("\n")}
											</p>
										</details>
									)}
									<p className="font-serif whitespace-pre-wrap">
										{text || (isLoading ? "Thinking…" : "")}
									</p>
									{message.role === "assistant" && text && !isLoading && (
										<div className="mt-2">
											<SpeakButton text={text} size="small" />
										</div>
									)}
								</div>
							</article>
						);
					})}
					<div ref={end} />
				</div>
				{error && (
					<p role="alert" className="font-serif text-red-300">
						{error.message}
					</p>
				)}
				<div className="flex items-center gap-3">
					<ListenButton onTranscription={send} disabled={isLoading || !available} />
					<textarea
						aria-label="Message"
						value={input}
						onChange={(event) => setInput(event.target.value)}
						rows={2}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
								event.preventDefault();
								send(input);
							}
						}}
						disabled={isLoading || !available}
						placeholder="Write in Vietnamese…"
						className="w-full resize-none rounded-2xl border-2 border-gold/30 bg-burgundy-dark px-4 py-3 font-serif text-warm-cream placeholder-warm-cream/50 focus:border-gold focus:outline-none disabled:opacity-50"
					/>
					<SendMessageButton
						state={isLoading ? "generating" : "idle"}
						onSend={() => send(input)}
						onStop={stop}
						disabled={!isLoading && (!input.trim() || !available)}
						size="medium"
					/>
				</div>
			</main>
		</div>
	);
}
