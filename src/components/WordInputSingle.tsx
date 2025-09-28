import { type ChangeEvent, useCallback } from "react";

interface WordInputSingleProps {
	text: string;
	hint?: string;
	onChange?: (text: string) => void;
}

export const WordInputSingle = ({
	text,
	hint,
	onChange,
}: WordInputSingleProps) => {
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
		<div className="relative">
			<input
				type="text"
				size={text.length}
				maxLength={text.length}
				className="relative z-10 font-mono text-3xl tracking-[3ch] outline-none"
				onChange={handleChange}
			/>
			<div className="-bottom-2 absolute ml-[-1ch] flex select-none flex-row space-x-[1ch] font-mono text-3xl">
				{hintChars.map((char, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: No valid key
						key={i}
						className="w-[3ch] border-gold border-b-2 font-mono text-3xl"
					>
						<span className="-top-1.5 relative ml-[1ch] opacity-50">
							{char}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
