import { Dialog } from "@base-ui/react/dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { LabeledSwitch } from "~/components/LabeledSwitch";
import { Select } from "~/components/Select";
import { Separator } from "~/components/Separator";
import { useLLM } from "~/providers/llm-provider";
import { useSTT } from "~/providers/stt-provider";
import { useTTS } from "~/providers/tts-provider";

export function AISettingsDrawer() {
	const [isOpen, setIsOpen] = useState(false);
	const { getSelectedVoice, setSelectedVoice, getAvailableVoices } = useTTS();
	const { getSelectedModel, setSelectedModel, getAvailableModels } = useSTT();
	const {
		selectedModel: selectedLLM,
		setSelectedModel: setSelectedLLM,
		availableModels: availableLLMs,
		thinkingEnabled,
		setThinkingEnabled,
	} = useLLM();

	const selectedVoiceEN = getSelectedVoice("en");
	const selectedModelEN = getSelectedModel("en");

	const availableVoicesEN = getAvailableVoices("en");
	const availableModelsEN = getAvailableModels("en");

	const handleTTSENChange = (value: string) => {
		const voice = availableVoicesEN.find((v) => v.id === value);
		if (voice) {
			setSelectedVoice("en", voice);
		}
	};

	const handleSTTENChange = (value: string) => {
		const model = availableModelsEN.find((m) => m.id === value);
		if (model) {
			setSelectedModel("en", model);
		}
	};

	const handleLLMChange = (value: string) => {
		const model = availableLLMs.find((m) => m.id === value);
		if (model) {
			setSelectedLLM(model);
		}
	};

	return (
		<>
			<Button
				size="small"
				onClick={() => setIsOpen(true)}
				className="inline-flex items-center gap-2"
				title="AI settings"
			>
				<SlidersHorizontal className="h-5 w-5" />
				Settings
			</Button>

			<Dialog.Root
				open={isOpen}
				onOpenChange={(open) => !open && setIsOpen(false)}
				modal={false}
			>
				<Dialog.Portal>
					{/* Backdrop */}
					<Dialog.Backdrop className="data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/25 transition-opacity duration-300 data-closed:animate-out data-open:animate-in" />

					{/* Drawer */}
					<Dialog.Popup className="data-closed:slide-out-to-left data-open:slide-in-from-left fixed top-0 left-0 z-50 h-full w-screen max-w-md bg-burgundy-dark shadow-xl transition-transform duration-300 data-closed:animate-out data-open:animate-in">
						<div className="flex h-full flex-col">
							{/* Header */}
							<div className="flex items-center justify-between px-6 py-4">
								<Dialog.Title className="font-semibold font-serif text-gold text-xl">
									AI Settings
								</Dialog.Title>
								<Dialog.Close className="rounded-md p-2 text-gold transition-colors hover:bg-gold/10">
									<span className="sr-only">Close panel</span>
									<X className="h-6 w-6" aria-hidden="true" />
								</Dialog.Close>
							</div>
							<Separator className="border-gold/20" />

							{/* Content */}
							<div className="flex-1 overflow-y-auto px-6 py-6">
								<div className="space-y-8">
									{/* English TTS Section */}
									<div>
										<div className="mb-3 font-medium font-serif text-gold text-sm">
											Speech synthesis model (EN):
										</div>
										<Select
											options={availableVoicesEN.map((voice) => ({
												label: voice.name,
												value: voice.id,
											}))}
											value={selectedVoiceEN.id}
											onChange={handleTTSENChange}
											placeholder="Select English voice"
											size="medium"
										/>
									</div>

									{/* English STT Section */}
									<div>
										<div className="mb-3 font-medium font-serif text-gold text-sm">
											Speech recognition model (EN):
										</div>
										<Select
											options={availableModelsEN.map((model) => ({
												label: model.name,
												value: model.id,
											}))}
											value={selectedModelEN.id}
											onChange={handleSTTENChange}
											placeholder="Select English model"
											size="medium"
										/>
									</div>

									{/* LLM Model Section */}
									<div>
										<div className="mb-3 font-medium font-serif text-gold text-sm">
											Conversational model:
										</div>
										<Select
											options={availableLLMs.map((model) => ({
												label: model.name,
												value: model.id,
											}))}
											value={selectedLLM?.id ?? ""}
											onChange={handleLLMChange}
											placeholder="Select model"
											size="medium"
										/>
										<LabeledSwitch
											label="Thinking mode"
											description="Improved quality, slower responses"
											checked={thinkingEnabled}
											onCheckedChange={setThinkingEnabled}
											size="medium"
											className="mt-4"
										/>
									</div>
								</div>
							</div>

							{/* Footer */}
							<Separator />
							<div className="px-6 py-4">
								<p className="font-serif text-sm text-warm-cream/70">
									Settings are automatically saved and will persist across
									sessions.
								</p>
							</div>
						</div>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
