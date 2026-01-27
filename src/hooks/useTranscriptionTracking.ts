import { useState } from "react";

/**
 * Shared hook for tracking voice transcriptions and their "new" state
 * Used by practice grid components to show correctness indicators
 */
export function useTranscriptionTracking() {
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

	return { transcriptions, newTranscriptions, handleTranscription };
}
