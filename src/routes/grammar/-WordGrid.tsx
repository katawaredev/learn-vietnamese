import { Markdown } from "~/components/Markdown";
import { PracticeGrid } from "~/layout/PracticeGrid";

export interface WordData {
	meaning: string;
	notes?: string[];
}

/**
 * Shared word grid for grammar modules.
 * Displays a grid of Vietnamese words/markers/particles with a meaning subtitle
 * and a bulleted notes list in the details popover. Note text supports inline
 * Markdown (bold, italic, code, strikethrough) via the Markdown component.
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
										<li key={note.slice(0, 30)}>
											<Markdown text={note} />
										</li>
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
