import { predict, type VoiceId } from "@diffusionstudio/vits-web";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { cva } from "class-variance-authority";
import { type FC, useCallback, useEffect, useState } from "react";

type SpeakState = "idle" | "processing" | "playing";

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
				idle: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/25",
				playing: "bg-blue-600 shadow-blue-500/50",
				processing: "bg-blue-500 cursor-wait",
			},
		},
		defaultVariants: {
			size: "medium",
			state: "idle",
		},
	},
);

interface SpeakButtonProps {
	text: string;
	voiceId?: VoiceId;
	playbackRate?: number;
	size?: "small" | "medium" | "large";
}

const SpeakButton: FC<SpeakButtonProps> = ({
	text,
	voiceId = "vi_VN-vais1000-medium",
	playbackRate = 0.8,
	size = "medium",
}) => {
	const [state, setState] = useState<SpeakState>("idle");
	const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
		null,
	);

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

	// Update playback rate when it changes
	useEffect(() => {
		if (currentAudio) {
			currentAudio.playbackRate = playbackRate;
		}
	}, [currentAudio, playbackRate]);

	// Stop current audio
	const stop = useCallback(() => {
		if (currentAudio) {
			currentAudio.pause();
			currentAudio.currentTime = 0;
		}
		setState("idle");
	}, [currentAudio]);

	// Generate and play audio
	const speak = useCallback(async () => {
		if (!text.trim()) return;

		// If already playing, stop
		if (state === "playing") {
			stop();
			return;
		}

		if (state !== "idle") return;

		try {
			// If we have cached audio, play it directly
			if (currentAudio) {
				currentAudio.currentTime = 0;
				await currentAudio.play();
				return;
			}

			setState("processing");

			// Generate audio with VITS
			const wav = await predict({
				text: text.trim(),
				voiceId: voiceId,
			});

			const audioUrl = URL.createObjectURL(wav);
			const audio = new Audio(audioUrl);
			setCurrentAudio(audio);

			audio.addEventListener("play", () => {
				setState("playing");
			});

			audio.addEventListener("ended", () => {
				setState("idle");
			});

			audio.addEventListener("error", (e) => {
				console.error("Audio playback failed:", e);
				setState("idle");
			});
			audio.playbackRate = playbackRate;
			await audio.play();
		} catch (error) {
			console.error("TTS failed:", error);
			setState("idle");
		}
	}, [text, state, stop, currentAudio, voiceId, playbackRate]);

	return (
		<button
			type="button"
			className={buttonVariants({ size, state })}
			onClick={speak}
			disabled={state === "processing" || !text.trim()}
			aria-label={state === "playing" ? "Stop speaking" : "Start speaking"}
		>
			{/* Speaker Icon */}
			<SpeakerWaveIcon
				className={`${
					size === "small"
						? "h-4 w-4"
						: size === "medium"
							? "h-6 w-6"
							: "h-8 w-8"
				} text-white`}
			/>

			{/* Processing indicator */}
			{state === "processing" && (
				<div className="absolute inset-1 animate-spin rounded-full border-2 border-white/30 border-t-white" />
			)}

			{/* Playing indicator */}
			{state === "playing" && (
				<div className="-inset-1 absolute animate-ping rounded-full border-2 border-blue-500/60" />
			)}
		</button>
	);
};

export default SpeakButton;
