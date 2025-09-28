import { MicrophoneIcon } from "@heroicons/react/24/outline";
import { cva } from "class-variance-authority";
import type React from "react";
import { useCallback, useRef, useState } from "react";

// Type definitions for our domain model
export type RecordingState = "idle" | "recording" | "processing";

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
				idle: "bg-stone-800 hover:bg-stone-900 shadow-stone-800/25",
				recording: "bg-stone-900 shadow-stone-800/45",
				processing: "bg-stone-800 cursor-wait",
			},
		},
		defaultVariants: {
			size: "medium",
			state: "idle",
		},
	},
);

export interface ListenBaseButtonProps {
	state: RecordingState;
	size?: "small" | "medium" | "large";
	onStartRecording: () => void;
	onStopRecording: () => void;
	disabled?: boolean;
}

export const ListenBaseButton: React.FC<ListenBaseButtonProps> = ({
	state,
	size = "medium",
	onStartRecording,
	onStopRecording,
	disabled = false,
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

	return (
		<button
			type="button"
			className={buttonVariants({ size, state })}
			onClick={handleClick}
			onMouseDown={handlePressStart}
			onMouseUp={handlePressEnd}
			onMouseLeave={handlePressEnd}
			onTouchStart={handlePressStart}
			onTouchEnd={handlePressEnd}
			disabled={disabled || state === "processing"}
			aria-label={state === "recording" ? "Stop recording" : "Start recording"}
		>
			{/* Microphone Icon */}
			<MicrophoneIcon
				className={`${
					size === "small"
						? "h-5 w-5"
						: size === "medium"
							? "h-7 w-7"
							: "h-9 w-9"
				} text-red-400`}
			/>

			{/* Processing indicator */}
			{state === "processing" && (
				<div className="absolute inset-1 animate-spin rounded-full border-2 border-stone-600/30 border-t-stone-300" />
			)}

			{/* Recording indicator */}
			{state === "recording" && (
				<div className="-inset-1 absolute animate-ping rounded-full border-2 border-red-500/60" />
			)}
		</button>
	);
};
