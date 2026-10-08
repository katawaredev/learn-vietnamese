import { cva } from "class-variance-authority";
import { Volume2 } from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { StateIndicator } from "./StateIndicator";

export type SpeechState = "idle" | "processing" | "speaking" | "ended";

const buttonVariants = cva(
	"relative flex shrink-0 items-center justify-center rounded-full border-0 shadow-lg transition-all duration-200 ease-in-out select-none",
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
	const isHolding = useRef(false);
	const suppressClick = useRef(false);
	const playbackRequest = useRef(0);
	const currentAudio = useRef<HTMLAudioElement | null>(null);
	const holdTimeout = useRef<NodeJS.Timeout | null>(null);
	// Stable refs for the currently attached audio event listeners so we can
	// remove them when the audio element is replaced or the component unmounts.
	const audioListeners = useRef<{
		play: () => void;
		ended: () => void;
		error: (e: Event) => void;
	} | null>(null);

	// Helper: detach listeners from an audio element and clear the ref
	const detachAudioListeners = useCallback((audio: HTMLAudioElement) => {
		if (audioListeners.current) {
			audio.removeEventListener("play", audioListeners.current.play);
			audio.removeEventListener("ended", audioListeners.current.ended);
			audio.removeEventListener("error", audioListeners.current.error);
			audioListeners.current = null;
		}
	}, []);

	// Invalidate pending audio generation and stop playback on unmount.
	// URLs are managed by the worker pool cache — do not revoke here
	useEffect(() => {
		return () => {
			playbackRequest.current += 1;
			if (currentAudio.current) {
				detachAudioListeners(currentAudio.current);
				currentAudio.current.pause();
			}
			if (holdTimeout.current) {
				clearTimeout(holdTimeout.current);
			}
		};
	}, [detachAudioListeners]);

	// Stop current audio
	const stop = useCallback(() => {
		if (currentAudio.current) {
			currentAudio.current.pause();
			currentAudio.current.currentTime = 0;
		}
		setState("idle");
	}, []);

	// Generate and play audio
	const play = useCallback(async () => {
		if (!canPlay()) return;

		// If already playing, stop
		if (state === "speaking") {
			stop();
			return;
		}

		if (state !== "idle" && state !== "ended") return;

		const request = ++playbackRequest.current;
		try {
			setState("processing");

			// Get audio from the worker pool (may be cached at pool level)
			const audio = await getAudio();
			if (request !== playbackRequest.current) return;

			// Remove listeners from the previous audio element before replacing it
			if (currentAudio.current) {
				detachAudioListeners(currentAudio.current);
				currentAudio.current.pause();
			}
			currentAudio.current = audio;

			const onPlay = () => setState("speaking");
			const onEnded = () => setState("ended");
			const onError = (e: Event) => {
				console.error("Audio playback failed:", e);
				setState("idle");
			};
			audioListeners.current = { play: onPlay, ended: onEnded, error: onError };

			audio.addEventListener("play", onPlay);
			audio.addEventListener("ended", onEnded);
			audio.addEventListener("error", onError);

			// Set initial speed based on current hold state
			audio.playbackRate = isHolding.current ? 0.5 : 0.8;
			await audio.play();
		} catch (error) {
			if (request !== playbackRequest.current) return;
			// Ignore AbortError - happens when playback is interrupted (expected behavior)
			if (error instanceof DOMException && error.name === "AbortError") {
				setState("idle");
				return;
			}
			console.error("Audio playback failed:", error);
			setState("idle");
		}
	}, [state, stop, getAudio, canPlay, detachAudioListeners]);

	const handlePressEnd = useCallback(() => {
		if (holdTimeout.current) {
			clearTimeout(holdTimeout.current);
			holdTimeout.current = null;
		}
		isHolding.current = false;
		if (currentAudio.current) currentAudio.current.playbackRate = 0.8;
	}, []);

	const handlePressStart = useCallback(() => {
		handlePressEnd();
		suppressClick.current = false;
		holdTimeout.current = setTimeout(() => {
			holdTimeout.current = null;
			isHolding.current = true;
			suppressClick.current = true;
			if (state === "speaking" && currentAudio.current) {
				currentAudio.current.playbackRate = 0.5;
			} else {
				void play();
			}
		}, 200);
	}, [handlePressEnd, state, play]);

	const isDisabled = disabled || state === "processing" || !canPlay();

	return (
		<button
			type="button"
			className={twMerge(buttonVariants({ size, state, disabled: isDisabled }), className)}
			onPointerDown={(event) => {
				if (event.button === 0) handlePressStart();
			}}
			onPointerUp={handlePressEnd}
			onPointerLeave={handlePressEnd}
			onPointerCancel={handlePressEnd}
			onClick={(event) => {
				if (suppressClick.current && event.detail > 0) {
					suppressClick.current = false;
					return;
				}
				void play();
			}}
			disabled={isDisabled}
			aria-label={state === "speaking" ? "Stop audio" : "Play audio"}
		>
			{/* Speaker Icon */}
			<Volume2
				className={`${
					size === "small" ? "h-5 w-5" : size === "medium" ? "h-7 w-7" : "h-9 w-9"
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
			className={twMerge(buttonVariants({ size, state: "idle", disabled: true }), className)}
			disabled
			aria-label="Loading"
		>
			<Volume2
				className={`${
					size === "small" ? "h-5 w-5" : size === "medium" ? "h-7 w-7" : "h-9 w-9"
				} text-sky-200`}
			/>

			<StateIndicator state="processing" loadingProgress={0} theme="sky" />
		</button>
	);
};
