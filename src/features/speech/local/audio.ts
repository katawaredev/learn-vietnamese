import { Effect } from "effect";
import { AppError } from "~/lib/app-error";
import { MAX_AUDIO_BYTES, MAX_RECORDING_MS } from "../contracts";

// Whisper consumes mono PCM at 16 kHz, rather than a compressed MediaRecorder blob.
export function decodeRecording(blob: Blob) {
	return Effect.scoped(
		Effect.gen(function* () {
			if (!blob.size || blob.size > MAX_AUDIO_BYTES)
				return yield* Effect.fail(
					new AppError({
						code: "validation",
						status: 0,
						message: "Recording is empty or too large.",
					}),
				);
			const context = yield* Effect.acquireRelease(
				Effect.try({
					try: () => new AudioContext(),
					catch: () =>
						new AppError({
							code: "unavailable",
							status: 0,
							message: "This browser cannot decode microphone audio for local recognition.",
						}),
				}),
				(value) => Effect.promise(() => value.close().catch(() => {})),
			);
			return yield* Effect.tryPromise({
				try: async (signal) => {
					const decoded = await context.decodeAudioData(await blob.arrayBuffer());
					if (signal.aborted) throw new Error("Recording decode cancelled.");
					if (!decoded.length || decoded.duration > MAX_RECORDING_MS / 1000 + 1)
						throw new Error("Invalid audio duration.");
					const frames = Math.min(
						Math.ceil(decoded.duration * 16_000),
						(16_000 * MAX_RECORDING_MS) / 1000,
					);
					const offline = new OfflineAudioContext(1, frames, 16_000);
					const source = offline.createBufferSource();
					source.buffer = decoded;
					source.connect(offline.destination);
					source.start();
					const resampled = await offline.startRendering();
					if (signal.aborted) throw new Error("Recording resampling cancelled.");
					return new Float32Array(resampled.getChannelData(0));
				},
				catch: () =>
					new AppError({
						code: "unavailable",
						status: 0,
						message: "Could not decode this recording for local recognition.",
					}),
			});
		}),
	).pipe(
		Effect.timeout("30 seconds"),
		Effect.mapError((error) =>
			error instanceof AppError
				? error
				: new AppError({ code: "unavailable", status: 0, message: "Recording decode timed out." }),
		),
	);
}
