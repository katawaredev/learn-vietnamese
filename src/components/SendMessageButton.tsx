import { cva } from "class-variance-authority";
import { Send } from "lucide-react";
import type { FC } from "react";
import { twMerge } from "tailwind-merge";
import { StateIndicator } from "./StateIndicator";

// Type definitions
export type SendButtonState = "idle" | "sending" | "loading";

const buttonVariants = cva(
	"relative rounded-full border-0 flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
	{
		variants: {
			size: {
				small: "w-12 h-12",
				medium: "w-16 h-16",
				large: "w-20 h-20",
			},
			state: {
				idle: "bg-sky-700 hover:bg-sky-800 shadow-sky-700/25",
				sending: "bg-sky-800 shadow-sky-700/45",
				loading: "bg-sky-700 cursor-wait",
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
	disabled?: boolean;
	loadingProgress?: number; // 0-100
}

export const SendMessageButton: FC<SendMessageButtonProps> = ({
	state,
	size = "medium",
	className,
	onSend,
	disabled = false,
	loadingProgress = 0,
}) => {
	const handleClick = () => {
		if (state === "idle" && !disabled) {
			onSend();
		}
	};

	return (
		<button
			type="button"
			className={twMerge(buttonVariants({ size, state }), className)}
			onClick={handleClick}
			disabled={disabled || state !== "idle"}
			aria-label="Send message"
		>
			{/* Send Icon */}
			<Send
				className={`${
					size === "small"
						? "h-5 w-5"
						: size === "medium"
							? "h-7 w-7"
							: "h-9 w-9"
				} text-sky-100`}
			/>

			{/* State indicators */}
			<StateIndicator
				state={state === "loading" ? "processing" : null}
				loadingProgress={loadingProgress}
				theme="sky"
			/>
		</button>
	);
};
