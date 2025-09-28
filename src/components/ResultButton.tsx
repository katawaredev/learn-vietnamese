import {
	CheckIcon,
	ChevronDownIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
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
	const buttonRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isNew) {
			const animation = isSuccess ? "animate-stamp" : "animate-shake";
			setAnimationClass(animation);

			// Auto-open popover on failure by clicking the button
			if (!isSuccess) {
				setTimeout(() => {
					buttonRef.current?.click();
				}, 100);
			}

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
			<div className="absolute top-2 left-2">
				<div className={`transition-colors ${animationClass}`}>
					<CheckIcon className={`${iconSize} text-green-400`} />
				</div>
			</div>
		);
	}

	// Failure: show icon with auto-opening popover
	return (
		<div className="absolute top-2 left-2">
			<Popover
				trigger={
					<div
						ref={buttonRef}
						className={`transition-colors ${animationClass}`}
					>
						<XMarkIcon
							className={`${iconSize} text-red-400 hover:text-red-300`}
						/>
					</div>
				}
				size="xl"
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
						<p className="mb-3 text-sm">Switch speech to text model</p>

						<div className="relative">
							<select
								className="block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark"
								value={selectedModel.id}
								onChange={handleModelChange}
							>
								{availableModels.map((model) => (
									<option
										key={model.id}
										value={model.id}
										className="text-black"
									>
										{model.name}
									</option>
								))}
							</select>
							<ChevronDownIcon
								className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-white/60"
								aria-hidden="true"
							/>
						</div>
					</div>
				</div>
			</Popover>
		</div>
	);
};
