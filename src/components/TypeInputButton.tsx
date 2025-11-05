import { cva } from "class-variance-authority";
import { Keyboard, Send } from "lucide-react";
import { type FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Popover } from "./Popover";

const buttonVariants = cva(
	"relative flex select-none items-center justify-center rounded-full border-0 bg-stone-800 shadow-lg shadow-stone-800/25 transition-all duration-200 ease-in-out",
	{
		variants: {
			size: {
				small: "h-12 w-12",
				medium: "h-16 w-16",
				large: "h-20 w-20",
			},
			disabled: {
				true: "cursor-not-allowed",
				false:
					"transform cursor-pointer hover:scale-105 hover:bg-stone-900 hover:shadow-xl active:scale-95",
			},
		},
		defaultVariants: {
			size: "medium",
			disabled: false,
		},
	},
);

export interface TypeInputButtonProps {
	onSubmit: (text: string) => void;
	size?: "small" | "medium" | "large";
	className?: string;
	disabled?: boolean;
	placeholder?: string;
}

export const TypeInputButton: FC<TypeInputButtonProps> = ({
	onSubmit,
	size = "medium",
	className,
	disabled = false,
	placeholder = "Type your message...",
}) => {
	const [inputValue, setInputValue] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = inputValue.trim();
		if (trimmed) {
			onSubmit(trimmed);
			setInputValue("");
		}
	};

	const iconSize =
		size === "small" ? "h-5 w-5" : size === "medium" ? "h-7 w-7" : "h-9 w-9";

	return (
		<Popover
			trigger={
				<div className={twMerge(buttonVariants({ size, disabled }), className)}>
					<Keyboard className={`${iconSize} text-blue-400`} />
				</div>
			}
			buttonClassName="p-0"
			disabled={disabled}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={placeholder}
					className="w-64 rounded-lg border-2 border-gold/30 bg-burgundy px-3 py-2 font-serif text-warm-cream placeholder-warm-cream/40 transition-colors focus:border-gold focus:outline-none"
					// biome-ignore lint/a11y/noAutofocus: Focus is needed
					autoFocus
				/>
				<button
					type="submit"
					disabled={!inputValue.trim()}
					className="flex items-center justify-center gap-2 rounded-lg border-2 border-gold/30 bg-burgundy px-4 py-2 font-serif text-warm-cream transition-colors hover:border-gold hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:hover:border-gold/30 disabled:hover:bg-burgundy"
				>
					<Send className="h-4 w-4" />
					<span>Send</span>
				</button>
			</form>
		</Popover>
	);
};
