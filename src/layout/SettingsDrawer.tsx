import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Select } from "~/components/Select";
import { useSTT } from "~/providers/stt-provider";
import { useTTS } from "~/providers/tts-provider";

interface SettingsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
	const { selectedVoice, setSelectedVoice, availableVoices } = useTTS();
	const { selectedModel, setSelectedModel, availableModels } = useSTT();

	const ttsOptions = availableVoices.map((voice) => ({
		label: voice.name,
		value: voice.id,
	}));

	const sttOptions = availableModels.map((model) => ({
		label: model.name,
		value: model.id,
	}));

	const handleTTSChange = (voiceId: string) => {
		const voice = availableVoices.find((v) => v.id === voiceId);
		if (voice) {
			setSelectedVoice(voice);
		}
	};

	const handleSTTChange = (modelId: string) => {
		const model = availableModels.find((m) => m.id === modelId);
		if (model) {
			setSelectedModel(model);
		}
	};

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			{/* Backdrop */}
			<DialogBackdrop className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-out data-[closed]:opacity-0" />

			{/* Drawer */}
			<div className="fixed inset-0 overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
						<DialogPanel className="pointer-events-auto relative w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full">
							<div className="flex h-full flex-col bg-burgundy-dark shadow-xl">
								{/* Header */}
								<div className="flex items-center justify-between border-gold/20 border-b px-6 py-4">
									<h2 className="font-semibold font-serif text-gold text-xl">
										Settings
									</h2>
									<button
										type="button"
										onClick={onClose}
										className="rounded-md p-2 text-gold transition-colors hover:bg-gold/10"
									>
										<span className="sr-only">Close panel</span>
										<XMarkIcon className="h-6 w-6" aria-hidden="true" />
									</button>
								</div>

								{/* Content */}
								<div className="flex-1 overflow-y-auto px-6 py-6">
									<div className="space-y-8">
										{/* Text to Speech Section */}
										<div>
											<div className="mb-3 block font-medium font-serif text-gold text-sm">
												Text to Speech
											</div>
											<Select
												options={ttsOptions}
												value={selectedVoice.id}
												onChange={handleTTSChange}
												placeholder="Select voice"
												size="medium"
												className="w-full"
											/>
										</div>

										{/* Speech to Text Section */}
										<div>
											<div className="mb-3 block font-medium font-serif text-gold text-sm">
												Speech to Text
											</div>
											<Select
												options={sttOptions}
												value={selectedModel.id}
												onChange={handleSTTChange}
												placeholder="Select model"
												size="medium"
												className="w-full"
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
						</DialogPanel>
					</div>
				</div>
			</div>
		</Dialog>
	);
}
