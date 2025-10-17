import { Dialog } from "@base-ui-components/react/dialog";
import { X } from "lucide-react";
import { useId } from "react";
import { Select } from "~/components/Select";
import { useLLM } from "~/providers/llm-provider";
import { useSTT } from "~/providers/stt-provider";
import { useTTS } from "~/providers/tts-provider";

interface SettingsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
	const ttsId = useId();
	const sttId = useId();
	const llmId = useId();
	const { selectedVoice, setSelectedVoice, availableVoices } = useTTS();
	const { selectedModel, setSelectedModel, availableModels } = useSTT();
	const {
		selectedModel: selectedLLM,
		setSelectedModel: setSelectedLLM,
		availableModels: availableLLMs,
	} = useLLM();

	const handleTTSChange = (value: string) => {
		const voice = availableVoices.find((v) => v.id === value);
		if (voice) {
			setSelectedVoice(voice);
		}
	};

	const handleSTTChange = (value: string) => {
		const model = availableModels.find((m) => m.id === value);
		if (model) {
			setSelectedModel(model);
		}
	};

	const handleLLMChange = (value: string) => {
		const model = availableLLMs.find((m) => m.id === value);
		if (model) {
			setSelectedLLM(model);
		}
	};

	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={(open) => !open && onClose()}
			modal={false}
		>
			<Dialog.Portal>
				{/* Backdrop */}
				<Dialog.Backdrop className="data-[closed]:fade-out-0 data-[open]:fade-in-0 fixed inset-0 z-50 bg-black/25 transition-opacity duration-300 data-[closed]:animate-out data-[open]:animate-in" />

				{/* Drawer */}
				<Dialog.Popup className="data-[closed]:slide-out-to-right data-[open]:slide-in-from-right fixed top-0 right-0 z-50 h-full w-screen max-w-md bg-burgundy-dark shadow-xl transition-transform duration-300 data-[closed]:animate-out data-[open]:animate-in">
					<div className="flex h-full flex-col">
						{/* Header */}
						<div className="flex items-center justify-between border-gold/20 border-b px-6 py-4">
							<Dialog.Title className="font-semibold font-serif text-gold text-xl">
								Settings
							</Dialog.Title>
							<Dialog.Close className="rounded-md p-2 text-gold transition-colors hover:bg-gold/10">
								<span className="sr-only">Close panel</span>
								<X className="h-6 w-6" aria-hidden="true" />
							</Dialog.Close>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-6 py-6">
							<div className="space-y-8">
								{/* Text to Speech Section */}
								<div>
									<label
										htmlFor={ttsId}
										className="mb-3 block font-medium font-serif text-gold text-sm"
									>
										Speech synthesis model:
									</label>
									<Select
										options={availableVoices.map((voice) => ({
											label: voice.name,
											value: voice.id,
										}))}
										value={selectedVoice.id}
										onChange={handleTTSChange}
										placeholder="Select voice"
										size="medium"
									/>
								</div>

								{/* Speech to Text Section */}
								<div>
									<label
										htmlFor={sttId}
										className="mb-3 block font-medium font-serif text-gold text-sm"
									>
										Speech recognition model:
									</label>
									<Select
										options={availableModels.map((model) => ({
											label: model.name,
											value: model.id,
										}))}
										value={selectedModel.id}
										onChange={handleSTTChange}
										placeholder="Select model"
										size="medium"
									/>
								</div>

								{/* LLM Model Section */}
								<div>
									<label
										htmlFor={llmId}
										className="mb-3 block font-medium font-serif text-gold text-sm"
									>
										Conversational model:
									</label>
									<Select
										options={availableLLMs.map((model) => ({
											label: model.name,
											value: model.id,
										}))}
										value={selectedLLM.id}
										onChange={handleLLMChange}
										placeholder="Select model"
										size="medium"
									/>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="border-gold/20 border-t px-6 py-4">
							<p className="font-serif text-sm text-warm-cream/70">
								Settings are automatically saved and will persist across
								sessions.
							</p>
						</div>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
