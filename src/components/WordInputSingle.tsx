import { type ChangeEvent, useCallback } from "react";
import { twMerge } from "tailwind-merge";

import type { WordInputProps } from "./WordInput";

export const WordInputSingle = ({
	text,
	hint,
	onChange,
	className,
}: WordInputProps) => {
	if (hint && hint.length !== text.length)
		throw new Error(
			`Hint length (${hint.length}) does not match text length (${text.length})`,
		);

	const hintChars = hint ? [...hint] : Array(text.length).fill(" ");

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value),
		[onChange],
	);

	return (
		<div className={twMerge("relative font-mono", className)}>
			<input
				type="text"
				size={text.length}
				maxLength={text.length}
				className="relative z-10 ml-[1ch] font-mono text-3xl tracking-[3ch] outline-none"
				onChange={handleChange}
			/>
			<div className="absolute -bottom-2 flex select-none flex-row space-x-[1ch] font-mono text-3xl">
				{hintChars.map((char, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: No valid key
						key={i}
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
};
