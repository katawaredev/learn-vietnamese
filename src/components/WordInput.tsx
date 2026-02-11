import { OTPInput, type SlotProps as OTPSlotProps } from "input-otp";
import { twMerge } from "tailwind-merge";
import { useNotifyTelexActive } from "~/providers/ui-provider";

export interface WordInputProps {
	text: string;
	hint?: string;
	onChange?: (text: string) => void;
	className?: string;
	autoFocus?: boolean;
}

function Slot({
	slot,
	hintChar,
}: {
	slot: OTPSlotProps;
	hintChar: string | null;
}) {
	const showHint = hintChar !== null && hintChar !== " ";

	return (
		<div
			className={twMerge(
				"relative flex h-10 w-8 items-end justify-center border-gold border-b-2 font-mono text-3xl",
				slot.isActive && "border-b-[3px]",
			)}
		>
			{showHint && <span className="pb-0.5 opacity-50">{hintChar}</span>}
			{slot.char !== null && (
				<span className="absolute inset-0 flex items-end justify-center pb-0.5">
					{slot.char}
				</span>
			)}
			{slot.hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-2">
					<div className="h-5 w-px animate-caret-blink bg-current duration-1000" />
				</div>
			)}
		</div>
	);
}

export const WordInput = ({
	text,
	hint,
	onChange,
	className,
	autoFocus,
}: WordInputProps) => {
	useNotifyTelexActive();

	const words = text.split(" ");
	const totalLength = text.replace(/ /g, "").length;

	// Flatten hint to match the flat slot array (spaces stripped, aligned with text)
	const flatHint = hint
		? hint.split("").filter((_, i) => text[i] !== " ")
		: null;

	// Map each word to its start index in the flat (space-stripped) slot array
	let slotIndex = 0;
	const wordSlots = words.map((word) => {
		const start = slotIndex;
		slotIndex += word.length;
		return { word, start };
	});

	return (
		<OTPInput
			maxLength={totalLength}
			onChange={onChange}
			containerClassName={twMerge("flex flex-wrap gap-x-8 gap-y-6", className)}
			inputMode="text"
			autoFocus={autoFocus}
			pasteTransformer={(pasted) => pasted.replaceAll(" ", "")}
			render={({ slots }) => (
				<>
					{wordSlots.map(({ word, start }, wi) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: slots are positional, no stable key available
						<div key={wi} className="flex gap-1">
							{word.split("").map((_, i) => (
								<Slot
									// biome-ignore lint/suspicious/noArrayIndexKey: slots are positional, no stable key available
									key={i}
									slot={slots[start + i]}
									hintChar={flatHint ? (flatHint[start + i] ?? null) : null}
								/>
							))}
						</div>
					))}
				</>
			)}
		/>
	);
};
