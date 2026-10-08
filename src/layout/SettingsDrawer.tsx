import { Dialog } from "@base-ui/react/dialog";
import { Trash2, X } from "lucide-react";
import { Button } from "~/components/Button";
import { Separator } from "~/components/Separator";
import { useSpeech } from "~/features/speech/provider";
import { SpeechSettings } from "~/features/speech/settings";
import { clearSpeechCache } from "~/features/speech/client";

interface SettingsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
	const { error, resetLanguage } = useSpeech();
	const reset = () => {
		clearSpeechCache();
		resetLanguage("vn");
	};
	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/25" />
				<Dialog.Popup className="fixed top-0 right-0 z-50 h-full w-screen max-w-md overflow-y-auto bg-burgundy-dark shadow-xl">
					<div className="flex items-center justify-between px-6 py-4">
						<Dialog.Title className="font-serif text-xl font-semibold text-gold">
							Speech settings
						</Dialog.Title>
						<Dialog.Close
							className="rounded-md p-2 text-gold hover:bg-gold/10"
							aria-label="Close settings"
						>
							<X className="h-6 w-6" />
						</Dialog.Close>
					</div>
					<Separator />
					<div className="space-y-8 px-6 py-6">
						<Dialog.Description className="font-serif text-sm text-warm-cream/70">
							Choose local AI models, browser speech, or a configured server. Local AI downloads
							models and processes text and recordings on your device. Larger models need more
							memory and storage. Server speech sends data to its service; browser speech may use
							your browser vendor's servers.
						</Dialog.Description>
						{error && (
							<p role="alert" className="text-sm text-red-300">
								{error}
							</p>
						)}
						<SpeechSettings language="vn" />
						<Button
							variant="outline"
							size="medium"
							onClick={reset}
							className="inline-flex w-full items-center justify-center gap-2"
						>
							<Trash2 className="h-5 w-5" /> Reset speech settings
						</Button>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
