import { cva } from "class-variance-authority";
import { Mic } from "lucide-react";
import { type FC, useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { ListenButtonProps } from "./ListenButton";
import { StateIndicator } from "./StateIndicator";

// Type definitions for our domain model
export type RecordingState = "idle" | "recording" | "processing";

const buttonVariants = cva(
	"relative flex select-none items-center justify-center rounded-full border-0 shadow-lg transition-all duration-200 ease-in-out",
	{
		variants: {
			size: {
				small: "h-12 w-12",
				medium: "h-16 w-16",
				large: "h-20 w-20",
			},
			state: {
				idle: "bg-stone-800 shadow-stone-800/25",
				recording: "bg-stone-900 shadow-stone-800/45",
				processing: "bg-stone-800",
			},
			disabled: {
				true: "cursor-not-allowed",
				false: "",
			},
		},
		compoundVariants: [
			// Interactive styles - only when NOT disabled
			{
				state: "idle",
				disabled: false,
				className:
					"transform cursor-pointer hover:scale-105 hover:bg-stone-900 hover:shadow-xl active:scale-95",
			},
			{
				state: "recording",
				disabled: false,
				className: "cursor-pointer",
			},
			{
				state: "processing",
				disabled: false,
				className: "cursor-wait",
			},
		],
		defaultVariants: {
			size: "medium",
			state: "idle",
			disabled: false,
		},
	},
);

export interface ListenBaseButtonProps
	extends Pick<ListenButtonProps, "className" | "size"> {
	state: RecordingState;
	onStartRecording: () => void;
	onStopRecording: () => void;
	disabled?: boolean;
	loadingProgress?: number; // 0-100
}

export const ListenBaseButton: FC<ListenBaseButtonProps> = ({
	state,
	size = "medium",
	className,
	onStartRecording,
	onStopRecording,
	disabled = false,
	loadingProgress = 0,
}) => {
	const [isHolding, setIsHolding] = useState(false);
	const holdTimeout = useRef<NodeJS.Timeout | null>(null);

	// Handle click (toggle recording)
	const handleClick = useCallback(() => {
		// If we're in hold mode, don't process click
		if (isHolding) return;

		if (state === "recording") {
			onStopRecording();
		} else if (state === "idle") {
			onStartRecording();
		}
	}, [state, isHolding, onStartRecording, onStopRecording]);

	// Handle mouse/touch down (start hold)
	const handlePressStart = useCallback(() => {
		if (state !== "idle") return;

		// Set a timeout to detect hold vs click
		holdTimeout.current = setTimeout(() => {
			setIsHolding(true);
			onStartRecording();
		}, 200); // 200ms threshold for hold detection
	}, [state, onStartRecording]);

	// Handle mouse/touch up (end hold)
	const handlePressEnd = useCallback(() => {
		if (holdTimeout.current) {
			clearTimeout(holdTimeout.current);
			holdTimeout.current = null;
		}

		if (isHolding && state === "recording") {
			onStopRecording();
			setIsHolding(false);
		}
	}, [isHolding, state, onStopRecording]);

	const isDisabled = disabled || state === "processing";

	return (
		<button
			type="button"
			className={twMerge(
				buttonVariants({ size, state, disabled: isDisabled }),
				className,
			)}
			onClick={handleClick}
			onMouseDown={handlePressStart}
			onMouseUp={handlePressEnd}
			onMouseLeave={handlePressEnd}
			onTouchStart={handlePressStart}
			onTouchEnd={handlePressEnd}
			disabled={isDisabled}
			aria-label={state === "recording" ? "Stop recording" : "Start recording"}
		>
			{/* Microphone Icon */}
			<Mic
				className={`${
					size === "small"
						? "h-5 w-5"
						: size === "medium"
							? "h-7 w-7"
							: "h-9 w-9"
				} text-red-400`}
			/>

			{/* State indicators */}
			<StateIndicator
				state={
					state === "recording"
						? "active"
						: state === "processing"
							? "processing"
							: null
				}
				loadingProgress={loadingProgress}
				theme="stone"
			/>
		</button>
	);
};
