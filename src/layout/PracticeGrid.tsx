import { Info } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ListenButton } from "~/components/ListenButton";
import { Popover } from "~/components/Popover";
import { Result } from "~/components/ResultButton";
import { SpeakButton } from "~/components/SpeakButton";
import { SpeakUrlButton } from "~/components/SpeakUrlButton";

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
}

export function PracticeGrid<T>({
	data,
	getSubtitle,
	getDetails,
}: PracticeGridProps<T>) {
	const [transcriptions, setTranscriptions] = useState<
		Record<string, string | null>
	>({});
	const [newTranscriptions, setNewTranscriptions] = useState<Set<string>>(
		new Set(),
	);

	const handleTranscription = (key: string, text: string) => {
		setTranscriptions((prev) => ({ ...prev, [key]: text }));
		setNewTranscriptions((prev) => new Set(prev).add(key));
		setTimeout(() => {
			setNewTranscriptions((prev) => {
				const next = new Set(prev);
				next.delete(key);
				return next;
			});
		}, 1500);
	};

	return (
		<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{Object.entries(data).map(([key, item]) => {
				const transcription = transcriptions[key];
				const details = getDetails?.(key, item);
				const hasDetails = details && Object.keys(details).length > 0;

				return (
					<div
						key={key}
						className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20"
					>
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
							<Result
								transcription={transcription}
								expectedText={key}
								isNew={newTranscriptions.has(key)}
							/>
						</div>

						{/* Main display */}
						<div className="text-center">
							<div className="py-8">
								<div className="-mb-4 font-bold text-6xl">{key}</div>
							</div>
							<div className="mb-4 h-5 font-mono text-sm text-white/70">
								{getSubtitle?.(item) || ""}
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex items-center justify-center gap-6">
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
					</div>
				);
			})}
		</div>
	);
}
