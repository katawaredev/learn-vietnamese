import { Check, ChevronDown, X } from "lucide-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useSTT } from "~/providers/stt-provider";
import { Popover } from "./Popover";

export interface ResultProps {
	transcription: string | null;
	expectedText: string;
	isNew?: boolean;
}

export const Result: FC<ResultProps> = ({
	transcription,
	expectedText,
	isNew = false,
}) => {
	// Helper function to normalize text for comparison
	const normalizeText = (text: string | null): string => {
		if (!text) return "";
		// Keep only alphanumeric characters and spaces, convert to lowercase
		return text
			.replace(/[^a-zA-Z0-9\s]/g, "") // Remove non-alphanumeric except spaces
			.replace(/\s+/g, " ") // Replace multiple spaces with single space
			.trim() // Remove leading/trailing spaces
			.toLowerCase();
	};

	const { selectedModel, setSelectedModel, availableModels } = useSTT();
	const normalizedTranscription = normalizeText(transcription);
	const normalizedExpected = normalizeText(expectedText);
	const isSuccess = normalizedTranscription === normalizedExpected;

	const [animationClass, setAnimationClass] = useState("");

	useEffect(() => {
		if (isNew) {
			const animation = isSuccess ? "animate-stamp" : "animate-shake";
			setAnimationClass(animation);

			const timer = setTimeout(() => setAnimationClass(""), 1000);
			return () => clearTimeout(timer);
		}
	}, [isSuccess, isNew]);

	const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const modelId = event.target.value;
		const model = availableModels.find((m) => m.id === modelId);
		if (model) {
			setSelectedModel(model);
		}
	};

	// Don't render if no transcription attempt was made
	if (!transcription) return null;

	const iconSize = "h-6 w-6";

	// Success: just show icon with animation
	if (isSuccess) {
		return (
			<div className={`transition-colors ${animationClass}`}>
				<Check className={`${iconSize} text-green-400`} />
			</div>
		);
	}

	// Failure: show icon with auto-opening popover
	return (
		<Popover
			trigger={
				<div className={`transition-colors ${animationClass}`}>
					<X className={`${iconSize} text-red-400 hover:text-red-300`} />
				</div>
			}
			defaultOpen={true}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<div>
						<strong>You said:</strong>
						<p className="text-sm">{transcription}</p>
					</div>
					<div>
						<strong>Expected:</strong>
						<p className="text-sm">{expectedText}</p>
					</div>
				</div>

				<div>
					<strong>Suggestions:</strong>
					<p className="mb-3 text-sm">Switch speech recognition model</p>

					<div className="relative">
						<select
							className="block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark"
							value={selectedModel.id}
							onChange={handleModelChange}
						>
							{availableModels.map((model) => (
								<option key={model.id} value={model.id} className="text-black">
									{model.name}
								</option>
							))}
						</select>
						<ChevronDown
							className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-white/60"
							aria-hidden="true"
						/>
					</div>
				</div>
			</div>
		</Popover>
	);
};
