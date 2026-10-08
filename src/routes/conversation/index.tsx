import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { SpeakButton } from "~/components/SpeakButton";
import { TypeInputButton } from "~/components/TypeInputButton";
import { AISettings, ConversationStatus } from "~/features/chat/settings";
import { useConversation } from "~/features/chat/use-conversation";
import Header from "~/layout/Header";
import {
	type Gender,
	getAllGenders,
	getAllPersonTypes,
	getGenderLabel,
	getPersonTypeLabel,
	type PersonType,
} from "~/features/chat/prompts";

export const Route = createFileRoute("/conversation/")({ component: ConversationRoute });

function ConversationRoute() {
	const conversation = useConversation("translate");
	const [personType, setPersonType] = useState<PersonType>("friend");
	const [userGender, setUserGender] = useState<Gender>("male");
	const [directions, setDirections] = useState<Array<"you" | "them">>([]);
	const {
		messages: chatMessages,
		sendMessage,
		isLoading: isTranslating,
		error,
		stop,
		clear,
	} = conversation;
	const exchanges = chatMessages
		.filter((message) => message.role === "user")
		.map((message, index) => {
			const position = chatMessages.indexOf(message);
			const reply = chatMessages[position + 1];
			const speaker = directions[index] ?? "you";
			return {
				id: message.id,
				speaker,
				originalText: message.parts
					.filter((part) => part.type === "text")
					.map((part) => part.content)
					.join("\n"),
				translatedText:
					reply?.role === "assistant"
						? reply.parts
								.filter((part) => part.type === "text")
								.map((part) => part.content)
								.join("\n")
						: "",
				translatedLang: speaker === "you" ? ("vn" as const) : ("en" as const),
				isTranslating: isTranslating && index === directions.length - 1,
			};
		});
	const messages = [...exchanges].toReversed();
	const resetConversation = () => {
		stop();
		clear();
		setDirections([]);
	};
	const handleGenderChange = (gender: Gender) => {
		resetConversation();
		setUserGender(gender);
	};
	const handlePersonTypeChange = (type: PersonType) => {
		resetConversation();
		setPersonType(type);
	};
	const handleTranscription = (text: string | null, speaker: "you" | "them") => {
		if (!text?.trim() || isTranslating || !conversation.available) return;
		setDirections((previous) => [...(chatMessages.length ? previous : []), speaker]);
		void sendMessage(text.trim(), {
			body: {
				mode: "translate",
				personType,
				gender: userGender,
				direction: speaker === "you" ? "en-to-vi" : "vi-to-en",
			},
		}).catch(() => {
			/* TanStack AI exposes failures through error. */
		});
	};

	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-burgundy-dark to-burgundy">
			<Header>
				<div className="flex items-center gap-3">
					<AISettings conversation={conversation} />
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
				</div>
			</Header>

			{/* Microphone Controls */}
			<div className="mx-auto w-full max-w-4xl px-6 pt-6">
				<div className="grid grid-cols-2 gap-6">
					{/* You (English → Vietnamese) */}
					<div className="flex flex-col items-center gap-3">
						<div className="flex flex-col items-center text-center">
							<select
								aria-label="Your pronoun preference"
								value={userGender}
								onChange={(e) => handleGenderChange(e.target.value as Gender)}
								className="h-10 rounded-xl border-2 border-gold/30 bg-burgundy-dark px-4 py-0 font-serif text-lg font-semibold text-warm-cream transition-colors focus:border-gold focus:outline-none"
								disabled={isTranslating}
							>
								{getAllGenders().map((gender) => (
									<option key={gender} value={gender}>
										{getGenderLabel(gender)}
									</option>
								))}
							</select>
							<p className="mt-1 font-serif text-sm text-warm-cream/70">English</p>
						</div>
						<div className="flex items-center gap-3">
							<ListenButton
								onTranscription={(text) => handleTranscription(text, "you")}
								lang="en"
								size="large"
								disabled={!conversation.available || isTranslating}
							/>
							<TypeInputButton
								onSubmit={(text) => handleTranscription(text, "you")}
								size="large"
								disabled={!conversation.available || isTranslating}
								placeholder="Type in English..."
							/>
						</div>
					</div>

					{/* Them (Vietnamese → English) */}
					<div className="flex flex-col items-center gap-3">
						<div className="flex flex-col items-center text-center">
							<select
								aria-label="Conversation relationship"
								value={personType}
								onChange={(e) => handlePersonTypeChange(e.target.value as PersonType)}
								className="h-10 rounded-xl border-2 border-gold/30 bg-burgundy-dark px-4 py-0 font-serif text-lg font-semibold text-warm-cream transition-colors focus:border-gold focus:outline-none"
								disabled={isTranslating}
							>
								{getAllPersonTypes().map((type) => (
									<option key={type} value={type}>
										{getPersonTypeLabel(type)}
									</option>
								))}
							</select>
							<p className="mt-1 font-serif text-sm text-warm-cream/70">Vietnamese</p>
						</div>
						<ListenButton
							onTranscription={(text) => handleTranscription(text, "them")}
							lang="vn"
							size="large"
							disabled={!conversation.available || isTranslating}
						/>
					</div>
				</div>
			</div>

			<ConversationStatus conversation={conversation} />
			{!conversation.available && (
				<output className="block px-6 text-center text-warm-cream/70">
					{conversation.unavailableMessage}
				</output>
			)}
			{error && (
				<p role="alert" className="px-6 text-center text-red-300">
					{error.message}
				</p>
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
								<p className="mb-1.5 font-serif text-xs leading-relaxed text-warm-cream/60">
									{msg.originalText}
								</p>

								{/* Translation or loading state */}
								{msg.isTranslating && !msg.translatedText ? (
									<p className="font-serif text-sm text-warm-cream/50 italic">
										{msg.translatedLang === "vn" ? "Translating..." : "Đang dịch..."}
									</p>
								) : (
									<div className="flex items-center gap-2">
										{/* Translation (main display) */}
										<p className="flex-1 font-serif text-base leading-relaxed text-warm-cream">
											{msg.translatedText}
										</p>

										{/* Speak button */}
										{msg.translatedText && !msg.isTranslating && (
											<SpeakButton
												text={msg.translatedText}
												lang={msg.translatedLang}
												size="small"
												className="shrink-0"
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
