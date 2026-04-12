import type { ReactNode } from "react";
import { PracticeGrid } from "~/layout/PracticeGrid";

export interface WordData {
	meaning: string;
	notes?: string[];
}

/** Parses ~~strikethrough~~ and __bold__ markup in notes. */
function renderNote(text: string): ReactNode {
	const parts = text.split(/(~~.+?~~|__.+?__)/g);
	if (parts.length === 1) return text;
	return parts.map((part) => {
		if (part.startsWith("~~") && part.endsWith("~~")) {
			const inner = part.slice(2, -2);
			return (
				<s key={inner} className="text-white/40">
					{inner}
				</s>
			);
		}
		if (part.startsWith("__") && part.endsWith("__")) {
			const inner = part.slice(2, -2);
			return (
				<strong key={inner} className="font-semibold text-white">
					{inner}
				</strong>
			);
		}
		return part;
	});
}

/**
 * Shared word grid for grammar modules.
 * Displays a grid of Vietnamese words/markers/particles with a meaning subtitle
 * and a bulleted notes list in the details popover.
 * Supports ~~strikethrough~~ in notes for correction examples.
 */
export function WordGrid({
	data,
	titleClassName,
}: {
	data: Record<string, WordData>;
	titleClassName?: string;
}) {
	return (
		<PracticeGrid<WordData>
			data={data}
			titleClassName={titleClassName}
			getSubtitle={(item) => item.meaning}
			getDetails={(_word, item) =>
				item.notes?.length
					? {
							Notes: (
								<ul className="mt-1 ml-4 list-disc space-y-1 text-sm text-white/70">
									{item.notes.map((note) => (
										<li key={note.slice(0, 30)}>{renderNote(note)}</li>
									))}
								</ul>
							),
						}
					: undefined
			}
			size="medium"
		/>
	);
}
