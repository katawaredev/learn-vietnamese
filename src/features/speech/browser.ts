import { Effect } from "effect";
import { AppError } from "~/lib/app-error";
import { browserResource } from "~/lib/browser-resource";
import { MAX_AUDIO_BYTES, MAX_RECORDING_MS, type Language } from "./contracts";

type PlaybackStarted = (setRate: (rate: number) => void) => void;
const browserError = (message: string) => new AppError({ code: "unavailable", status: 0, message });
let activeSpeech: { utterance: SpeechSynthesisUtterance; finish: () => void } | undefined;

export function playAudio(
	audio: Blob | Effect.Effect<Blob, AppError>,
	rate: number,
	onStarted: PlaybackStarted,
) {
	return Effect.scoped(
		Effect.gen(function* () {
			const context = yield* Effect.acquireRelease(
				Effect.try({
					try: () => new AudioContext(),
					catch: () => browserError("Audio playback is unavailable in this browser."),
				}),
				(value) => Effect.promise(() => value.close().catch(() => {})),
			);
			// Unlock sound in the original click, before model downloads or synthesis await.
			yield* Effect.tryPromise({
				try: () => context.resume(),
				catch: () => browserError("Your browser blocked sound. Allow audio and try again."),
			}).pipe(
				Effect.timeout("5 seconds"),
				Effect.mapError(() =>
					browserError("Your browser blocked sound. Allow audio and try again."),
				),
			);
			const blob = yield* Effect.isEffect(audio) ? audio : Effect.succeed(audio);
			const buffer = yield* Effect.tryPromise({
				try: async (signal) => {
					const bytes = await blob.arrayBuffer();
					signal.throwIfAborted();
					return context.decodeAudioData(bytes);
				},
				catch: () =>
					browserError("Could not decode this voice's audio. Try another voice in settings."),
			});
			const source = yield* Effect.acquireRelease(
				Effect.sync(() => context.createBufferSource()),
				(value) =>
					Effect.sync(() => {
						value.onended = null;
						try {
							value.stop();
						} catch {
							// A source that failed before start has nothing to stop.
						}
						value.disconnect();
					}),
			);
			source.buffer = buffer;
			source.playbackRate.value = rate;
			source.connect(context.destination);
			yield* browserResource<void, AppError>((resume) => {
				source.onended = () => resume(Effect.void);
				try {
					source.start();
					onStarted((value) => {
						source.playbackRate.value = value;
					});
				} catch {
					resume(Effect.fail(browserError("Could not start audio playback. Please try again.")));
				}
				return () => {
					source.onended = null;
				};
			});
		}),
	);
}

export function speakBrowser(
	text: string,
	language: Language,
	voiceURI: string | undefined,
	rate: number,
	onStarted: PlaybackStarted,
) {
	return browserResource<void, AppError>((resume) => {
		if (!window.speechSynthesis) {
			resume(Effect.fail(browserError("Speech playback is unavailable in this browser.")));
			return undefined;
		}
		const synthesis = window.speechSynthesis;
		const voice = synthesis
			.getVoices()
			.find(
				(entry) =>
					entry.voiceURI === voiceURI &&
					entry.lang.toLowerCase().startsWith(language === "vn" ? "vi" : "en"),
			);
		if (!voice) {
			resume(
				Effect.fail(
					browserError(
						"No voice is available for this language. Select a server voice in settings.",
					),
				),
			);
			return undefined;
		}
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.voice = voice;
		utterance.lang = language === "vn" ? "vi-VN" : "en-US";
		utterance.rate = rate;
		utterance.onstart = () =>
			onStarted((value) => {
				utterance.rate = value;
			});
		utterance.onend = () => resume(Effect.void);
		utterance.onerror = (event) =>
			resume(
				event.error === "canceled" || event.error === "interrupted"
					? Effect.void
					: Effect.fail(browserError("Browser speech playback failed.")),
			);
		activeSpeech?.finish();
		synthesis.cancel();
		activeSpeech = { utterance, finish: () => resume(Effect.void) };
		try {
			synthesis.speak(utterance);
		} catch {
			resume(Effect.fail(browserError("Could not start browser speech playback.")));
		}
		return () => {
			utterance.onstart = null;
			utterance.onend = null;
			utterance.onerror = null;
			if (activeSpeech?.utterance === utterance) {
				activeSpeech = undefined;
				synthesis.cancel();
			}
		};
	}).pipe(
		Effect.timeout("90 seconds"),
		Effect.mapError((error) =>
			error instanceof AppError ? error : browserError("Browser speech playback timed out."),
		),
	);
}

function microphone() {
	return Effect.callback<MediaStream, AppError>((resume, signal) => {
		if (!navigator.mediaDevices?.getUserMedia) {
			resume(
				Effect.fail(
					browserError(
						"Microphone recording requires a supported browser and a secure connection.",
					),
				),
			);
			return;
		}
		void navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				if (signal.aborted) stream.getTracks().forEach((track) => track.stop());
				else resume(Effect.succeed(stream));
			})
			.catch(() =>
				resume(
					Effect.fail(
						new AppError({
							code: "permission",
							status: 0,
							message: "Could not access your microphone. Check its permission and connection.",
						}),
					),
				),
			);
	});
}

export function recordAudio(onStarted: (stop: () => void) => void) {
	return Effect.scoped(
		Effect.gen(function* () {
			const stream = yield* Effect.acquireRelease(
				microphone(),
				(value) => Effect.sync(() => value.getTracks().forEach((track) => track.stop())),
				{ interruptible: true },
			);
			return yield* browserResource<Blob, AppError>((resume) => {
				if (typeof MediaRecorder === "undefined") {
					resume(Effect.fail(browserError("This browser cannot record audio.")));
					return undefined;
				}
				const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].find(
					(type) => MediaRecorder.isTypeSupported(type),
				);
				let recorder: MediaRecorder;
				try {
					recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
				} catch {
					resume(Effect.fail(browserError("This browser cannot record audio.")));
					return undefined;
				}
				const chunks: Blob[] = [];
				let bytes = 0;
				const stop = () => {
					if (recorder.state !== "inactive") recorder.stop();
				};
				recorder.ondataavailable = ({ data }) => {
					bytes += data.size;
					if (bytes > MAX_AUDIO_BYTES) {
						resume(Effect.fail(browserError("The recording is too large. Try a shorter phrase.")));
						return;
					}
					if (data.size) chunks.push(data);
				};
				recorder.onerror = () => resume(Effect.fail(browserError("Microphone recording failed.")));
				recorder.onstop = () =>
					resume(Effect.succeed(new Blob(chunks, { type: recorder.mimeType })));
				try {
					recorder.start(1000);
					onStarted(stop);
				} catch {
					resume(Effect.fail(browserError("Could not start microphone recording.")));
				}
				const maximum = setTimeout(stop, MAX_RECORDING_MS);
				// Silence ends short practice attempts; the hard limit also covers browsers without Web Audio.
				let context: AudioContext | undefined;
				let interval: ReturnType<typeof setInterval> | undefined;
				try {
					context = new AudioContext();
					const source = context.createMediaStreamSource(stream);
					const analyser = context.createAnalyser();
					analyser.fftSize = 512;
					source.connect(analyser);
					const data = new Float32Array(analyser.fftSize);
					let lastSpeech = Date.now();
					let heardSpeech = false;
					interval = setInterval(() => {
						analyser.getFloatTimeDomainData(data);
						const rms = Math.sqrt(
							data.reduce((sum, value) => sum + value * value, 0) / data.length,
						);
						if (rms > 0.015) {
							heardSpeech = true;
							lastSpeech = Date.now();
						}
						if (heardSpeech && Date.now() - lastSpeech > 1500) stop();
					}, 100);
				} catch {
					/* Recording still works without silence detection. */
				}
				return () => {
					clearTimeout(maximum);
					clearInterval(interval);
					recorder.onstop = null;
					recorder.ondataavailable = null;
					recorder.onerror = null;
					stop();
					if (context) void context.close().catch(() => {});
				};
			});
		}),
	).pipe(
		Effect.timeout("90 seconds"),
		Effect.mapError((error) =>
			error instanceof AppError
				? error
				: browserError("Microphone access or recording timed out. Please try again."),
		),
	);
}

export function recognizeBrowser(language: Language, onStarted: (stop: () => void) => void) {
	return browserResource<string | null, AppError>((resume) => {
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Recognition) {
			resume(
				Effect.fail(
					browserError(
						"Speech recognition is unavailable in this browser. Select local AI or server recognition in settings.",
					),
				),
			);
			return undefined;
		}
		const recognition = new Recognition();
		recognition.lang = language === "vn" ? "vi-VN" : "en-US";
		recognition.interimResults = false;
		recognition.continuous = false;
		let result: string | null = null;
		recognition.onstart = () => onStarted(() => recognition.stop());
		recognition.onresult = (event) => {
			result = event.results[0]?.[0]?.transcript.trim() || null;
		};
		recognition.onend = () => resume(Effect.succeed(result));
		recognition.onerror = (event) =>
			resume(
				event.error === "no-speech"
					? Effect.succeed(null)
					: Effect.fail(
							browserError(
								"Browser speech recognition failed. Check microphone permission or try server recognition.",
							),
						),
			);
		try {
			recognition.start();
		} catch {
			resume(Effect.fail(browserError("Could not start speech recognition.")));
		}
		const maximum = setTimeout(() => recognition.stop(), MAX_RECORDING_MS);
		return () => {
			clearTimeout(maximum);
			recognition.onstart = null;
			recognition.onresult = null;
			recognition.onerror = null;
			recognition.onend = null;
			recognition.abort();
		};
	}).pipe(
		Effect.timeout("70 seconds"),
		Effect.mapError((error) =>
			error instanceof AppError
				? error
				: browserError("Speech recognition timed out. Please try again."),
		),
	);
}
