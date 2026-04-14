import { twMerge } from "tailwind-merge";
import { GRAMMAR_TYPE_COLORS } from "~/routes/grammar/-grammar-colors";

interface ChunkButtonProps {
	text: string;
	grammarType: string;
	meaning: string;
	state: "available" | "placed" | "distractor-revealed";
	onClick: () => void;
}

export function ChunkButton({
	text,
	grammarType,
	meaning,
	state,
	onClick,
}: ChunkButtonProps) {
	const typeColor = GRAMMAR_TYPE_COLORS[grammarType] ?? "text-white/70";

	return (
		<button
			type="button"
			onClick={onClick}
			className={twMerge(
				"cursor-pointer rounded-xl border px-3 py-2 text-center transition-all duration-200",
				state === "available" &&
					"border-white/20 bg-white/[0.08] hover:border-white/40 hover:bg-white/[0.12]",
				state === "placed" && "border-gold bg-gold/20",
				state === "distractor-revealed" &&
					"border-red-400/50 bg-red-400/10 line-through opacity-60",
			)}
		>
			<div className="font-semibold text-lg leading-tight">{text}</div>
			<div className={twMerge("text-[0.65rem] leading-tight", typeColor)}>
				{grammarType}
			</div>
			<div className="text-[0.6rem] text-white/50 leading-tight">{meaning}</div>
		</button>
	);
}
