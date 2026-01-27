import { type KeyboardEvent, useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import type { WordInputProps } from "./WordInput";

export const WordInputMultiple = ({
	text,
	hint,
	className,
	onChange,
}: WordInputProps) => {
	const words = text.split(" ");

	// Parse hint by matching word positions in the original text
	const hintWords = hint
		? (() => {
				const result: string[] = [];
				let hintPos = 0;

				for (let i = 0; i < words.length; i++) {
					const word = words[i];

					// Skip exactly one space separator (except for the first word)
					if (i > 0 && hintPos < hint.length && hint[hintPos] === " ") {
						hintPos++;
					}

					// Extract hint characters for this word
					const wordHint = hint.slice(hintPos, hintPos + word.length);
					result.push(wordHint.padEnd(word.length, " "));

					hintPos += word.length;
				}

				return result;
			})()
		: words.map((word) => " ".repeat(word.length));

	const [values, setValues] = useState<string[]>(words.map(() => ""));
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const focusInput = useCallback((index: number, position?: number) => {
		const input = inputRefs.current[index];
		if (input) {
			input.focus();
			if (position !== undefined) {
				setTimeout(() => input.setSelectionRange(position, position), 0);
			}
		}
	}, []);

	const handleChange = useCallback(
		(wordIndex: number, value: string) => {
			const newValues = [...values];
			newValues[wordIndex] = value.slice(0, words[wordIndex].length);
			setValues(newValues);

			// Auto-advance to next input if current word is filled
			if (
				value.length === words[wordIndex].length &&
				wordIndex < words.length - 1
			) {
				setTimeout(() => focusInput(wordIndex + 1, 0), 0);
			}

			// Call onChange with complete text
			onChange?.(newValues.join(" "));
		},
		[values, words, onChange, focusInput],
	);

	const handleKeyDown = useCallback(
		(wordIndex: number, e: KeyboardEvent<HTMLInputElement>) => {
			const input = e.currentTarget;
			const cursorPosition = input.selectionStart || 0;
			const value = values[wordIndex];

			switch (e.key) {
				case "ArrowRight":
					if (cursorPosition === value.length && wordIndex < words.length - 1) {
						e.preventDefault();
						focusInput(wordIndex + 1, 0);
					}
					break;

				case "ArrowLeft":
					if (cursorPosition === 0 && wordIndex > 0) {
						e.preventDefault();
						focusInput(wordIndex - 1, values[wordIndex - 1].length);
					}
					break;

				case "Backspace": {
					const selectionStart = input.selectionStart || 0;
					const selectionEnd = input.selectionEnd || 0;
					const hasSelection = selectionStart !== selectionEnd;

					// Only apply cross-word backspace if there's no selection, cursor is at start, and not first word
					if (!hasSelection && cursorPosition === 0 && wordIndex > 0) {
						e.preventDefault();
						const newValues = [...values];
						const prevValue = newValues[wordIndex - 1];
						if (prevValue.length > 0) {
							newValues[wordIndex - 1] = prevValue.slice(0, -1);
							setValues(newValues);
							onChange?.(newValues.join(" "));
						}
						focusInput(wordIndex - 1, newValues[wordIndex - 1].length);
					}
					break;
				}
			}
		},
		[values, words.length, focusInput, onChange],
	);

	return (
		<div className={twMerge("flex flex-wrap gap-y-4", className)}>
			{words.map((word, wordIndex) => {
				const hintChars = [...hintWords[wordIndex]];

				return (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: No valid key
						key={wordIndex}
						className="relative inline-block font-mono"
					>
						<input
							ref={(el) => {
								inputRefs.current[wordIndex] = el;
							}}
							type="text"
							maxLength={word.length}
							value={values[wordIndex]}
							size={word.length}
							className="relative z-10 ml-[1ch] min-w-0 bg-transparent font-mono text-3xl tracking-[3ch] outline-none"
							onChange={(e) => handleChange(wordIndex, e.target.value)}
							onKeyDown={(e) => handleKeyDown(wordIndex, e)}
						/>
						<div className="absolute -bottom-2 flex select-none flex-row space-x-[1ch] font-mono text-3xl">
							{hintChars.map((char, charIndex) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: No valid key
									key={charIndex}
									className="w-[3ch] border-gold border-b-2 font-mono text-3xl"
								>
									<span className="relative -top-1.5 ml-[1ch] opacity-50">
										{char}
									</span>
								</div>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
};
