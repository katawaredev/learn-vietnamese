import { cva } from "class-variance-authority";
import { Volume2 } from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { StateIndicator } from "./StateIndicator";

export type SpeechState = "idle" | "processing" | "speaking" | "ended";

const buttonVariants = cva(
	"relative flex shrink-0 select-none items-center justify-center rounded-full border-0 shadow-lg transition-all duration-200 ease-in-out",
	{
		variants: {
			size: {
				small: "h-12 w-12",
				medium: "h-16 w-16",
				large: "h-20 w-20",
			},
			state: {
				idle: "bg-sky-800 shadow-sky-800/25",
				speaking: "bg-sky-900 shadow-sky-800/40",
				processing: "bg-sky-800",
				ended: "bg-sky-800 shadow-sky-800/25",
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
					"transform cursor-pointer hover:scale-105 hover:bg-sky-800 hover:shadow-xl active:scale-95",
			},
			{
				state: "speaking",
				disabled: false,
				className: "cursor-pointer",
			},
			{
				state: "processing",
				disabled: false,
				className: "cursor-wait",
			},
			{
				state: "ended",
				disabled: false,
				className:
					"transform cursor-pointer hover:scale-105 hover:bg-sky-800 hover:shadow-xl active:scale-95",
			},
		],
		defaultVariants: {
			size: "medium",
			state: "idle",
			disabled: false,
		},
	},
);

export interface SpeakBaseButtonProps {
	className?: string;
	size?: "small" | "medium" | "large";
	getAudio: () => Promise<HTMLAudioElement>;
	canPlay: () => boolean;
	disabled?: boolean;
	isGenerating?: boolean;
	loadingProgress?: number; // 0-100
}

export const SpeakBaseButton: FC<SpeakBaseButtonProps> = ({
	className,
	size = "medium",
	getAudio,
	canPlay,
	disabled = false,
	isGenerating = false,
	loadingProgress = 0,
}) => {
	const [state, setState] = useState<SpeechState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
		null,
	);
	const holdTimeout = useRef<NodeJS.Timeout | null>(null);

	// Cleanup effect - stop audio but don't revoke URLs
	// URLs are managed by the worker pool cache
	useEffect(() => {
		return () => {
			if (currentAudio) {
				currentAudio.pause();
			}
		};
	}, [currentAudio]);

	// Update playback rate when holding state changes
	useEffect(() => {
		if (currentAudio) {
			currentAudio.playbackRate = isHolding ? 0.5 : 0.8;
		}
	}, [currentAudio, isHolding]);

	// Stop current audio
	const stop = useCallback(() => {
		if (currentAudio) {
			currentAudio.pause();
			currentAudio.currentTime = 0;
		}
		setState("idle");
	}, [currentAudio]);

	// Generate and play audio
	const play = useCallback(async () => {
		if (!canPlay()) return;

		// If already playing, stop
		if (state === "speaking") {
			stop();
			return;
		}

		if (state !== "idle" && state !== "ended") return;

		try {
			setState("processing");

			// Get audio from the worker pool (may be cached at pool level)
			const audio = await getAudio();
			setCurrentAudio(audio);

			audio.addEventListener("play", () => {
				setState("speaking");
			});

			audio.addEventListener("ended", () => {
				setState("ended");
			});

			audio.addEventListener("error", (e) => {
				console.error("Audio playback failed:", e);
				setState("idle");
			});

			// Set initial speed based on current hold state
			audio.playbackRate = isHolding ? 0.5 : 0.8;
			await audio.play();
		} catch (error) {
			// Ignore AbortError - happens when playback is interrupted (expected behavior)
			if (error instanceof DOMException && error.name === "AbortError") {
				setState("idle");
				return;
			}
			console.error("Audio playback failed:", error);
			setState("idle");
		}
	}, [state, stop, getAudio, canPlay, isHolding]);

	// Handle press start (mouse/touch down)
	const handlePressStart = useCallback(() => {
		if (state === "speaking") {
			// Audio is already playing - set up hold detection to slow it down
			holdTimeout.current = setTimeout(() => {
				setIsHolding(true);
			}, 200);
			return;
		}

		if (state !== "idle" && state !== "ended") return;

		// Reset state to idle if it was ended
		if (state === "ended") {
			setState("idle");
		}

		// Set up timer to detect hold vs quick press
		holdTimeout.current = setTimeout(() => {
			setIsHolding(true);
			play();
		}, 200);
	}, [state, play]);

	// Handle press end (mouse/touch up)
	const handlePressEnd = useCallback(() => {
		// Clear timeout if still active (quick press scenario)
		if (holdTimeout.current) {
			clearTimeout(holdTimeout.current);
			holdTimeout.current = null;

			// Quick press - start playing at normal speed if idle
			if (state === "idle") {
				play();
			}
		}

		// Reset hold state and prevent replay if audio ended during hold
		if (isHolding) {
			setIsHolding(false);
		}
	}, [state, play, isHolding]);

	const isDisabled = disabled || state === "processing" || !canPlay();

	return (
		<button
			type="button"
			className={twMerge(
				buttonVariants({ size, state, disabled: isDisabled }),
				className,
			)}
			onMouseDown={handlePressStart}
			onMouseUp={handlePressEnd}
			onMouseLeave={handlePressEnd}
			onTouchStart={handlePressStart}
			onTouchEnd={handlePressEnd}
			disabled={isDisabled}
			aria-label={state === "speaking" ? "Stop audio" : "Play audio"}
		>
			{/* Speaker Icon */}
			<Volume2
				className={`${
					size === "small"
						? "h-5 w-5"
						: size === "medium"
							? "h-7 w-7"
							: "h-9 w-9"
				} text-sky-200`}
			/>

			{/* State indicators */}
			<StateIndicator
				state={
					state === "speaking"
						? "active"
						: state === "processing" || isGenerating
							? "processing"
							: null
				}
				loadingProgress={loadingProgress}
				theme="sky"
			/>
		</button>
	);
};

export const SpeakButtonLoading = ({
	size,
	className,
}: Pick<SpeakBaseButtonProps, "size" | "className">) => {
	return (
		<button
			type="button"
			className={twMerge(
				buttonVariants({ size, state: "idle", disabled: true }),
				className,
			)}
			disabled
			aria-label="Loading"
		>
			<Volume2
				className={`${
					size === "small"
						? "h-5 w-5"
						: size === "medium"
							? "h-7 w-7"
							: "h-9 w-9"
				} text-sky-200`}
			/>

			<StateIndicator state="processing" loadingProgress={0} theme="sky" />
		</button>
	);
};
