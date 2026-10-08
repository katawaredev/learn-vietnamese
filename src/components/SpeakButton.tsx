import { Effect } from "effect";
import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { playAudio, speakBrowser } from "~/features/speech/browser";
import { invalidateSpeech, synthesize } from "~/features/speech/client";
import { synthesizeLocal } from "~/features/speech/local/client";
import type { Language } from "~/features/speech/contracts";
import { useSpeech } from "~/features/speech/provider";
import { errorMessage } from "~/lib/app-error";
import { speechButtonVariants, type SpeechState } from "./SpeakBaseButton";
import { StateIndicator } from "./StateIndicator";

export interface SpeakButtonProps {
	text: string;
	lang?: Language;
	size?: "small" | "medium" | "large";
	className?: string;
}

export function SpeakButton({ lang = "vn", ...props }: SpeakButtonProps) {
	const { preferences, voiceIds, localModels } = useSpeech();
	return (
		<SpeechPlayback
			key={`${preferences.tts[lang]}:${voiceIds[lang]}:${localModels.tts[lang]}:${lang}:${props.text}`}
			{...props}
			lang={lang}
		/>
	);
}

function SpeechPlayback({ text, lang = "vn", size = "medium", className }: SpeakButtonProps) {
	const { preferences, capabilities, voiceIds, localModels, ready } = useSpeech();
	const [state, setState] = useState<SpeechState>("idle");
	const [error, setError] = useState<string | null>(null);
	const active = useRef<AbortController | null>(null);
	const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const slow = useRef(false);
	const suppressClick = useRef(false);
	const setRate = useRef<((rate: number) => void) | undefined>(undefined);
	const backend = preferences.tts[lang];
	const available =
		backend === "server"
			? capabilities.tts[lang]
			: backend === "local"
				? typeof Worker !== "undefined"
				: !!voiceIds[lang];

	useEffect(
		() => () => {
			active.current?.abort();
			clearTimeout(hold.current);
		},
		[],
	);

	const stop = () => {
		active.current?.abort();
		active.current = null;
		setRate.current = undefined;
		setState("idle");
	};
	const play = () => {
		if (active.current) {
			stop();
			return;
		}
		if (!ready || !available || !text.trim()) return;
		const controller = new AbortController();
		active.current = controller;
		setError(null);
		setState("processing");
		const started = (changeRate: (rate: number) => void) => {
			if (controller.signal.aborted) return;
			setRate.current = changeRate;
			changeRate(slow.current ? 0.5 : 0.8);
			setState("speaking");
		};
		const program =
			backend !== "browser"
				? playAudio(
						backend === "local"
							? synthesizeLocal(text, lang, localModels.tts[lang])
							: synthesize({ text: text.trim(), language: lang }),
						slow.current ? 0.5 : 0.8,
						started,
					)
				: speakBrowser(text.trim(), lang, voiceIds[lang], slow.current ? 0.5 : 0.8, started);
		void Effect.runPromise(program, { signal: controller.signal })
			.then(() => {
				if (!controller.signal.aborted) setState("ended");
			})
			.catch((reason: unknown) => {
				if (!controller.signal.aborted) {
					if (backend === "server") invalidateSpeech({ text: text.trim(), language: lang });
					setError(errorMessage(reason));
					setState("idle");
				}
			})
			.finally(() => {
				if (active.current === controller) {
					active.current = null;
					setRate.current = undefined;
				}
			});
	};
	const release = () => {
		clearTimeout(hold.current);
		slow.current = false;
		setRate.current?.(0.8);
	};
	const disabled = !ready || !available || !text.trim();

	return (
		<span className="inline-flex flex-col items-center gap-1">
			<button
				type="button"
				className={twMerge(speechButtonVariants({ size, state, disabled }), className)}
				disabled={disabled}
				aria-label={state === "speaking" || state === "processing" ? "Stop audio" : "Play audio"}
				title={
					disabled ? "Choose an available voice in settings" : "Play audio; hold for slower speech"
				}
				onPointerDown={(event) => {
					if (event.button !== 0) return;
					release();
					suppressClick.current = false;
					hold.current = setTimeout(() => {
						slow.current = true;
						suppressClick.current = true;
						if (setRate.current) setRate.current(0.5);
						else if (!active.current) play();
					}, 200);
				}}
				onPointerUp={release}
				onPointerLeave={release}
				onPointerCancel={release}
				onClick={(event) => {
					if (suppressClick.current && event.detail > 0) {
						suppressClick.current = false;
						return;
					}
					play();
				}}
			>
				<Volume2
					className={`${size === "small" ? "h-5 w-5" : size === "medium" ? "h-7 w-7" : "h-9 w-9"} text-sky-200`}
				/>
				<StateIndicator
					state={state === "speaking" ? "active" : state === "processing" ? "processing" : null}
					theme="sky"
				/>
			</button>
			{error && (
				<span role="alert" className="max-w-64 text-xs text-red-300">
					{error}
				</span>
			)}
		</span>
	);
}
