import { cva } from "class-variance-authority";
import { Send, Square } from "lucide-react";
import type { FC } from "react";
import { twMerge } from "tailwind-merge";
import { StateIndicator } from "./StateIndicator";

// Type definitions
export type SendButtonState = "idle" | "sending" | "loading" | "generating";

const buttonVariants = cva(
	"relative flex transform cursor-pointer select-none items-center justify-center rounded-full border-0 shadow-lg transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95",
	{
		variants: {
			size: {
				small: "h-12 w-12",
				medium: "h-16 w-16",
				large: "h-20 w-20",
			},
			state: {
				idle: "bg-sky-700 shadow-sky-700/25 hover:bg-sky-800",
				sending: "bg-sky-800 shadow-sky-700/45",
				loading: "cursor-wait bg-sky-700",
				generating: "bg-sky-700 shadow-sky-700/25 hover:bg-sky-800",
			},
		},
		defaultVariants: {
			size: "medium",
			state: "idle",
		},
	},
);

export interface SendMessageButtonProps {
	state: SendButtonState;
	size?: "small" | "medium" | "large";
	className?: string;
	onSend: () => void;
	onStop?: () => void;
	disabled?: boolean;
	loadingProgress?: number; // 0-100
}

export const SendMessageButton: FC<SendMessageButtonProps> = ({
	state,
	size = "medium",
	className,
	onSend,
	onStop,
	disabled = false,
	loadingProgress = 0,
}) => {
	const handleClick = () => {
		if (state === "generating" && onStop) {
			onStop();
		} else if (state === "idle" && !disabled) {
			onSend();
		}
	};

	const isGenerating = state === "generating";
	const iconSizeClass =
		size === "small" ? "h-5 w-5" : size === "medium" ? "h-7 w-7" : "h-9 w-9";

	return (
		<button
			type="button"
			className={twMerge(buttonVariants({ size, state }), className)}
			onClick={handleClick}
			disabled={disabled || (state !== "idle" && state !== "generating")}
			aria-label={isGenerating ? "Stop generation" : "Send message"}
		>
			{/* Icon - Square for stop, Send for normal */}
			{isGenerating ? (
				<Square className={`${iconSizeClass} text-red-100`} />
			) : (
				<Send className={`${iconSizeClass} text-sky-100`} />
			)}

			{/* State indicators */}
			<StateIndicator
				state={state === "loading" ? "processing" : null}
				loadingProgress={loadingProgress}
				theme="sky"
			/>
		</button>
	);
};
