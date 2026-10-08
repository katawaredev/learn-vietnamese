import { Dialog } from "@base-ui/react/dialog";
import { useHydrated } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "~/components/Button";
import { Select } from "~/components/Select";
import { Separator } from "~/components/Separator";
import { Switch } from "~/components/Switch";
import { SpeechSettings } from "~/features/speech/settings";
import type { Conversation } from "./use-conversation";

export function AISettings({ conversation }: { conversation: Conversation }) {
	const hydrated = useHydrated();
	const [open, setOpen] = useState(false);
	const id = useId();
	return (
		<>
			<Button
				size="small"
				onClick={() => setOpen(true)}
				aria-label="AI settings"
				disabled={!hydrated}
				className="inline-flex items-center gap-2"
			>
				<SlidersHorizontal className="h-4 w-4" /> Settings
			</Button>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/25" />
					<Dialog.Popup className="fixed top-0 left-0 z-50 h-full w-screen max-w-md overflow-y-auto bg-burgundy-dark shadow-xl">
						<div className="flex items-center justify-between px-4 py-4">
							<Dialog.Title className="font-serif text-xl font-semibold text-gold">
								AI Settings
							</Dialog.Title>
							<Dialog.Close
								className="rounded-md p-2 text-gold hover:bg-gold/10"
								aria-label="Close AI settings"
							>
								<X className="h-6 w-6" />
							</Dialog.Close>
						</div>
						<Separator />
						<div className="space-y-6 px-4 py-6">
							<Dialog.Description className="font-serif text-sm text-warm-cream/70">
								English speech and conversation models for AI Conversation and Live Chat.
							</Dialog.Description>
							<SpeechSettings language="en" showHeading={false} />
							<label
								htmlFor={`${id}-model`}
								className="block space-y-2 font-serif text-sm text-gold"
							>
								<span>Conversational model:</span>
								<Select
									id={`${id}-model`}
									options={conversation.modelOptions}
									value={conversation.selectedModel}
									onChange={conversation.setModel}
								/>
							</label>
							<p className="font-serif text-xs text-warm-cream/70">
								{conversation.preferences.backend === "local"
									? `English and Vietnamese · about ${conversation.localModel?.memoryGB ?? 2.3} GB GPU memory, depending on your device. Downloads on first message and caches for next time; conversations stay on this device.`
									: "Conversations are sent to the configured chat service. Model changes start a fresh conversation."}
							</p>
							<div className="flex items-center justify-between gap-4">
								<label htmlFor={`${id}-thinking`} className="font-serif text-sm text-gold">
									Thinking mode
									<span className="mt-1 block text-xs text-warm-cream/70">
										{conversation.thinkingAvailable
											? "More reasoning, slower responses"
											: "Unavailable for live translation or this chat service"}
									</span>
								</label>
								<Switch
									id={`${id}-thinking`}
									checked={conversation.thinkingAvailable && conversation.preferences.thinking}
									onCheckedChange={conversation.setThinking}
									disabled={!conversation.thinkingAvailable}
								/>
							</div>
							{!conversation.available && (
								<output className="block font-serif text-sm text-warm-cream/70">
									{conversation.unavailableMessage}
								</output>
							)}
							{conversation.catalogError && (
								<p role="alert" className="font-serif text-sm text-red-300">
									{conversation.catalogError}
								</p>
							)}
						</div>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}

export function ConversationStatus({ conversation }: { conversation: Conversation }) {
	if (conversation.preferences.backend !== "local" || conversation.localStatus.state === "idle")
		return null;
	return (
		<p
			role={conversation.localStatus.state === "error" ? "alert" : "status"}
			className="mx-auto max-w-4xl px-6 pb-4 text-center font-serif text-sm text-warm-cream/70"
		>
			{conversation.localStatus.message}
		</p>
	);
}
