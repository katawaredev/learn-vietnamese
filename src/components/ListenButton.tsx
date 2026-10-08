import { Effect } from "effect";
import { useEffect, useRef, useState } from "react";
import { recognizeBrowser, recordAudio } from "~/features/speech/browser";
import { transcribe } from "~/features/speech/client";
import { transcribeLocal } from "~/features/speech/local/client";
import { decodeRecording } from "~/features/speech/local/audio";
import type { Language } from "~/features/speech/contracts";
import { useSpeech } from "~/features/speech/provider";
import { errorMessage } from "~/lib/app-error";
import { numberToText } from "~/utils/numeric";
import { ListenBaseButton, type RecordingState } from "./ListenBaseButton";

export interface ListenButtonProps {
	onTranscription: (text: string | null) => void;
	lang?: Language;
	size?: "small" | "medium" | "large";
	className?: string;
	disabled?: boolean;
}

export function ListenButton({ lang = "vn", ...props }: ListenButtonProps) {
	const { preferences, localModels } = useSpeech();
	return (
		<SpeechRecorder
			key={`${preferences.stt[lang]}:${localModels.stt[lang]}:${lang}`}
			{...props}
			lang={lang}
		/>
	);
}

function SpeechRecorder({
	onTranscription,
	lang = "vn",
	size = "medium",
	className,
	disabled = false,
}: ListenButtonProps) {
	const { preferences, capabilities, localModels, ready } = useSpeech();
	const [state, setState] = useState<RecordingState>("idle");
	const [error, setError] = useState<string | null>(null);
	const active = useRef<AbortController | null>(null);
	const stopRecording = useRef<(() => void) | undefined>(undefined);
	const backend = preferences.stt[lang];
	const available =
		backend !== "browser"
			? (backend === "local"
					? typeof Worker !== "undefined" && typeof AudioContext !== "undefined"
					: capabilities.stt) && typeof MediaRecorder !== "undefined"
			: typeof window !== "undefined" &&
				!!(window.SpeechRecognition || window.webkitSpeechRecognition);
	useEffect(() => () => active.current?.abort(), []);

	const start = () => {
		if (active.current || !ready || !available || disabled) return;
		const controller = new AbortController();
		active.current = controller;
		setState("processing");
		setError(null);
		const started = (stop: () => void) => {
			if (!controller.signal.aborted) {
				stopRecording.current = stop;
				setState("recording");
			}
		};
		const program =
			backend !== "browser"
				? recordAudio(started).pipe(
						Effect.flatMap((audio) => {
							if (!controller.signal.aborted) setState("processing");
							return backend === "local"
								? decodeRecording(audio).pipe(
										Effect.flatMap((pcm) => transcribeLocal(pcm, lang, localModels.stt[lang])),
									)
								: transcribe(audio, lang);
						}),
					)
				: recognizeBrowser(lang, started);
		void Effect.runPromise(program, { signal: controller.signal })
			.then((text) => {
				if (controller.signal.aborted) return;
				let result = text;
				if (lang === "vn" && text && /^\d+$/.test(text)) {
					try {
						result = numberToText(Number(text));
					} catch {
						/* Keep numbers outside the lesson range. */
					}
				}
				onTranscription(result);
			})
			.catch((reason: unknown) => {
				if (!controller.signal.aborted) setError(errorMessage(reason));
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					active.current = null;
					stopRecording.current = undefined;
					setState("idle");
				}
			});
	};
	return (
		<span className="inline-flex flex-col items-center gap-1">
			<ListenBaseButton
				state={state}
				size={size}
				className={className}
				onStartRecording={start}
				onCancel={() => {
					active.current?.abort();
					active.current = null;
					stopRecording.current = undefined;
					setState("idle");
				}}
				onStopRecording={() => {
					setState("processing");
					stopRecording.current?.();
				}}
				disabled={disabled || !ready || !available}
			/>
			{error && (
				<span role="alert" className="max-w-64 text-xs text-red-300">
					{error}
				</span>
			)}
		</span>
	);
}
