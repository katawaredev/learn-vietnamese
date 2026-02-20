import { Dialog } from "@base-ui/react/dialog";
import { Trash2, X } from "lucide-react";
import { Button } from "~/components/Button";
import { Select } from "~/components/Select";
import { Separator } from "~/components/Separator";
import { useSTT } from "~/providers/stt-provider";
import { useTTS } from "~/providers/tts-provider";
import { clearAudioCache } from "~/utils/audio-cache";

interface SettingsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
	const { getSelectedVoice, setSelectedVoice, getAvailableVoices } = useTTS();
	const { getSelectedModel, setSelectedModel, getAvailableModels } = useSTT();
	const handleReset = async () => {
		await clearAudioCache();
		const cacheKeys = await caches.keys();
		await Promise.all(cacheKeys.map((key) => caches.delete(key)));
		localStorage.clear();
		window.location.href = "/";
	};

	const selectedVoiceVN = getSelectedVoice("vn");
	const selectedModelVN = getSelectedModel("vn");

	const availableVoicesVN = getAvailableVoices("vn");
	const availableModelsVN = getAvailableModels("vn");

	const handleTTSVNChange = (value: string) => {
		const voice = availableVoicesVN.find((v) => v.id === value);
		if (voice) {
			setSelectedVoice("vn", voice);
		}
	};

	const handleSTTVNChange = (value: string) => {
		const model = availableModelsVN.find((m) => m.id === value);
		if (model) {
			setSelectedModel("vn", model);
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
				<Dialog.Backdrop className="data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/25 transition-opacity duration-300 data-closed:animate-out data-open:animate-in" />

				{/* Drawer */}
				<Dialog.Popup className="data-closed:slide-out-to-right data-open:slide-in-from-right fixed top-0 right-0 z-50 h-full w-screen max-w-md bg-burgundy-dark shadow-xl transition-transform duration-300 data-closed:animate-out data-open:animate-in">
					<div className="flex h-full flex-col">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4">
							<Dialog.Title className="font-semibold font-serif text-gold text-xl">
								Settings
							</Dialog.Title>
							<Dialog.Close className="rounded-md p-2 text-gold transition-colors hover:bg-gold/10">
								<span className="sr-only">Close panel</span>
								<X className="h-6 w-6" aria-hidden="true" />
							</Dialog.Close>
						</div>
						<Separator className="border-gold/20" />

						{/* Content */}
						<div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
							<div className="space-y-8">
								{/* Vietnamese TTS Section */}
								<div>
									<div className="mb-3 font-medium font-serif text-gold text-sm">
										Speech synthesis model (VN):
									</div>
									<Select
										options={availableVoicesVN.map((voice) => ({
											label: voice.name,
											value: voice.id,
										}))}
										value={selectedVoiceVN.id}
										onChange={handleTTSVNChange}
										placeholder="Select Vietnamese voice"
										size="medium"
									/>
								</div>

								{/* Vietnamese STT Section */}
								<div>
									<div className="mb-3 font-medium font-serif text-gold text-sm">
										Speech recognition model (VN):
									</div>
									<Select
										options={availableModelsVN.map((model) => ({
											label: model.name,
											value: model.id,
										}))}
										value={selectedModelVN.id}
										onChange={handleSTTVNChange}
										placeholder="Select Vietnamese model"
										size="medium"
									/>
								</div>
							</div>

							<Button
								variant="outline"
								size="medium"
								onClick={handleReset}
								className="mt-auto inline-flex w-full items-center justify-center gap-2"
							>
								<Trash2 className="h-5 w-5" />
								Reset data
							</Button>
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
	);
}
