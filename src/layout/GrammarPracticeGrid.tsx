import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "~/components/Card";
import { ListenButton } from "~/components/ListenButton";
import { Popover } from "~/components/Popover";
import { ResultVoiceIndicator } from "~/components/ResultIndicator";
import { SpeakButton } from "~/components/SpeakButton";
import { useTranscriptionTracking } from "~/hooks/useTranscriptionTracking";
import { GRAMMAR_TYPE_COLORS } from "~/lib/grammar-colors";

export interface BreakdownItem {
	type: string;
	meaning: string;
}

export interface Example {
	vietnamese: string;
	breakdown: Record<string, BreakdownItem>;
	english: string;
	literalEnglish?: string;
	notes?: string;
	comparison?: string;
	particleUsed?: string;
}

interface GrammarPracticeGridProps {
	examples: Example[];
}

/**
 * Removes subscript numbers from Vietnamese words (e.g., "biết₁" → "biết")
 * Used for tracking multiple instances of the same word in breakdown annotations
 */
function stripSubscript(word: string): string {
	return word.replace(/[₀-₉]+$/, "");
}

export function GrammarPracticeGrid({ examples }: GrammarPracticeGridProps) {
	const { transcriptions, newTranscriptions, handleTranscription } =
		useTranscriptionTracking();

	// CSS Grid with auto-fit: creates only as many columns as needed without stretching
	// Reference: https://css-tricks.com/snippets/css/complete-guide-grid/#aa-fluid-columns-snippet
	return (
		<div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,350px),1fr))]">
			{examples.map((example) => {
				const key = example.vietnamese;
				const transcription = transcriptions[key];
				const words = Object.keys(example.breakdown);

				// Build info details with vertical breakdown table
				const details: Record<string, ReactNode> = {
					"Word Breakdown": (
						<table className="w-full text-sm">
							<tbody>
								{/* Row 1: Vietnamese words */}
								<tr>
									{words.map((word) => (
										<td
											key={`${word}-vn`}
											className="border-white/10 border-r px-3 py-2 text-center font-medium text-warm-cream last:border-r-0"
										>
											{stripSubscript(word)}
										</td>
									))}
								</tr>
								{/* Row 2: Types (colored) */}
								<tr>
									{words.map((word) => {
										const item = example.breakdown[word];
										const colorClass =
											GRAMMAR_TYPE_COLORS[item.type] || "text-gray-400";
										return (
											<td
												key={`${word}-type`}
												className={`border-white/10 border-r px-3 py-2 text-center text-xs ${colorClass} last:border-r-0`}
											>
												{item.type}
											</td>
										);
									})}
								</tr>
								{/* Row 3: Meanings */}
								<tr>
									{words.map((word) => (
										<td
											key={`${word}-meaning`}
											className="border-white/10 border-r px-3 py-2 text-center text-white/70 text-xs last:border-r-0"
										>
											{example.breakdown[word].meaning}
										</td>
									))}
								</tr>
							</tbody>
						</table>
					),
				};

				// Add optional fields
				if (example.literalEnglish) {
					details.Literal = example.literalEnglish;
				}
				if (example.notes) {
					details.Note = example.notes;
				}
				if (example.comparison) {
					details.Compare = example.comparison;
				}
				if (example.particleUsed) {
					details["Particle Used"] = example.particleUsed;
				}

				return (
					<Card key={key} className="flex flex-col">
						{/* Info button - top right corner */}
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
							{/* Title with colored words based on grammar type */}
							<div className="mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
								{words.map((word) => {
									const item = example.breakdown[word];
									const displayWord = stripSubscript(word);
									const colorClass =
										GRAMMAR_TYPE_COLORS[item.type] || "text-gray-400";

									// Responsive text size based on total sentence length
									const totalLength = key.length;
									const textSize =
										totalLength > 30
											? "text-3xl"
											: totalLength > 20
												? "text-4xl"
												: totalLength > 12
													? "text-5xl"
													: "text-6xl";

									return (
										<span
											key={word}
											className={`font-bold ${textSize} ${colorClass}`}
										>
											{displayWord}
										</span>
									);
								})}
							</div>

							{/* Subtitle (English translation) */}
							<div className="mb-4 px-2 font-mono text-sm text-white/70">
								{example.english}
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex items-center justify-center gap-6 pb-4">
							<SpeakButton text={key} size="small" />
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
