import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "~/components/Card";
import { ListenButton } from "~/components/ListenButton";
import { Popover } from "~/components/Popover";
import { ResultVoiceIndicator } from "~/components/ResultIndicator";
import { SpeakButton } from "~/components/SpeakButton";
import { SpeakUrlButton } from "~/components/SpeakUrlButton";
import { useTranscriptionTracking } from "~/hooks/useTranscriptionTracking";

type PracticeItem<T> = T & {
	url?: string | null;
};

interface PracticeData<T> {
	[key: string]: PracticeItem<T>;
}

interface PracticeGridProps<T> {
	data: PracticeData<T>;
	getSubtitle?: (item: PracticeItem<T>) => string;
	getDetails?: (
		name: string,
		item: PracticeItem<T>,
	) => Record<string, ReactNode> | undefined;
	size?: "small" | "medium" | "large";
}

export function PracticeGrid<T>({
	data,
	getSubtitle,
	getDetails,
	size = "small",
}: PracticeGridProps<T>) {
	const { transcriptions, newTranscriptions, handleTranscription } =
		useTranscriptionTracking();

	const gridClassName = {
		small:
			"grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
		medium: "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4",
		large: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
	}[size];

	return (
		<div className={gridClassName}>
			{Object.entries(data).map(([key, item]) => {
				const transcription = transcriptions[key];
				const details = getDetails?.(key, item);
				const hasDetails = details && Object.keys(details).length > 0;

				let titleClassName = "text-6xl";
				if (size === "small") {
					if (key.length > 6) titleClassName = "text-3xl";
					else if (key.length > 4) titleClassName = "text-5xl";
				} else if (size === "medium") {
					if (key.length > 8) titleClassName = "text-4xl";
					else if (key.length > 5) titleClassName = "text-6xl";
					else titleClassName = "text-7xl";
				} else {
					// large
					if (key.length > 10) titleClassName = "text-5xl";
					else if (key.length > 6) titleClassName = "text-7xl";
					else titleClassName = "text-8xl";
				}

				return (
					<Card key={key} className="flex flex-col">
						{/* Info button - top right corner */}
						{hasDetails && (
							<div className="absolute top-2 right-2">
								<Popover
									trigger={<Info className="h-6 w-6 text-gold" />}
									buttonClassName="opacity-60 hover:opacity-100 transition-opacity p-2"
								>
									<div className="space-y-3">
										{Object.entries(details).map(([label, component]) => (
											<div key={label}>
												<strong>{label}:</strong> {component}
											</div>
										))}
									</div>
								</Popover>
							</div>
						)}

						{/* Result indicator */}
						<div className="absolute top-2 left-2">
							<ResultVoiceIndicator
								key={transcription}
								transcription={transcription}
								expectedText={key}
								isNew={newTranscriptions.has(key)}
							/>
						</div>

						{/* Main display */}
						<div className="flex flex-1 flex-col justify-center pt-8 text-center">
							<div className="mb-2">
								<div className={twMerge("font-bold", titleClassName)}>
									{key}
								</div>
							</div>
							<div className="mb-4 px-2 font-mono text-sm text-white/70">
								{getSubtitle?.(item) || ""}
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex items-center justify-center gap-6 pb-4">
							{item.url ? (
								<SpeakUrlButton url={item.url} size="small" />
							) : (
								<SpeakButton text={key} size="small" />
							)}
							<ListenButton
								onTranscription={(text) => handleTranscription(key, text)}
								size="small"
							/>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
