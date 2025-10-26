import { cva } from "class-variance-authority";
import { Volume2 } from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { StateIndicator } from "./StateIndicator";

export type SpeechState = "idle" | "processing" | "speaking" | "ended";

const buttonVariants = cva(
	"relative rounded-full border-0 flex items-center justify-center select-none transition-all duration-200 ease-in-out shadow-lg",
	{
		variants: {
			size: {
				small: "w-12 h-12",
				medium: "w-16 h-16",
				large: "w-20 h-20",
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
					"cursor-pointer hover:bg-sky-800 hover:shadow-xl transform hover:scale-105 active:scale-95",
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
					"cursor-pointer hover:bg-sky-800 hover:shadow-xl transform hover:scale-105 active:scale-95",
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

	// Cleanup effect
	useEffect(() => {
		return () => {
			if (currentAudio) {
				currentAudio.pause();
				if (currentAudio.src) {
					URL.revokeObjectURL(currentAudio.src);
				}
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
			// If we have cached audio, play it directly
			if (currentAudio) {
				currentAudio.currentTime = 0;
				await currentAudio.play();
				return;
			}

			setState("processing");

			// Get audio from the provided function
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
			console.error("Audio playback failed:", error);
			setState("idle");
		}
	}, [state, stop, currentAudio, getAudio, canPlay, isHolding]);

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
