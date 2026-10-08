import { Effect, Schema } from "effect";
import { AppError, ErrorResponse } from "~/lib/app-error";
import { readBytes } from "~/lib/http-body";
import {
	Capabilities,
	MAX_AUDIO_BYTES,
	Transcript,
	type SynthesisRequest,
	type Language,
} from "./contracts";

const audioCache = new Map<string, Blob>();
const MAX_CACHE_BYTES = 20 * 1024 * 1024;
export const clearSpeechCache = () => audioCache.clear();
export const invalidateSpeech = (input: SynthesisRequest) =>
	audioCache.delete(JSON.stringify(input));

function parseJSON(bytes: Uint8Array) {
	return Effect.try({
		try: (): unknown => JSON.parse(new TextDecoder().decode(bytes)),
		catch: () =>
			new AppError({
				code: "provider",
				status: 502,
				message: "The speech service returned invalid JSON.",
			}),
	});
}

function request(url: string, maximum: number, init?: RequestInit) {
	return Effect.scoped(
		Effect.gen(function* () {
			const controller = yield* Effect.acquireRelease(
				Effect.sync(() => new AbortController()),
				(value) => Effect.sync(() => value.abort()),
			);
			const response = yield* Effect.tryPromise({
				try: () => fetch(url, { ...init, signal: controller.signal }),
				catch: () =>
					new AppError({
						code: "unavailable",
						status: 0,
						message: "Could not connect to the speech service.",
					}),
			});
			const bytes = yield* readBytes(response, maximum).pipe(
				Effect.mapError(
					() =>
						new AppError({
							code: "provider",
							status: 502,
							message: "The speech service returned an invalid or oversized response.",
						}),
				),
			);
			if (!response.ok) {
				const body = yield* parseJSON(bytes).pipe(Effect.orElseSucceed(() => null));
				const parsed = Schema.decodeUnknownOption(ErrorResponse)(body);
				return yield* Effect.fail(
					new AppError({
						code: "provider",
						status: response.status,
						message:
							parsed._tag === "Some"
								? parsed.value.error.message
								: "The speech service failed. Please try again.",
					}),
				);
			}
			return { bytes, type: response.headers.get("content-type") ?? "" };
		}),
	).pipe(
		Effect.timeout("95 seconds"),
		Effect.mapError((error) =>
			error instanceof AppError
				? error
				: new AppError({
						code: "unavailable",
						status: 504,
						message: "The speech service timed out.",
					}),
		),
	);
}

export const getCapabilities = request("/api/speech/capabilities", 128 * 1024).pipe(
	Effect.flatMap((response) => parseJSON(response.bytes)),
	Effect.flatMap(Schema.decodeUnknownEffect(Capabilities)),
	Effect.mapError((error) =>
		error instanceof AppError
			? error
			: new AppError({
					code: "provider",
					status: 502,
					message: "Invalid speech settings from the server.",
				}),
	),
);

export function synthesize(input: SynthesisRequest) {
	const key = JSON.stringify(input);
	return Effect.suspend(() => {
		const cached = audioCache.get(key);
		if (cached) {
			audioCache.delete(key);
			audioCache.set(key, cached);
			return Effect.succeed(cached);
		}
		return request("/api/speech/synthesize", MAX_AUDIO_BYTES, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: key,
		}).pipe(
			Effect.flatMap(({ bytes, type }) =>
				bytes.length && type.startsWith("audio/")
					? Effect.succeed(new Blob([bytes], { type }))
					: Effect.fail(
							new AppError({
								code: "provider",
								status: 502,
								message: "The service returned invalid audio.",
							}),
						),
			),
			Effect.tap((audio) =>
				Effect.sync(() => {
					audioCache.set(key, audio);
					let total = [...audioCache.values()].reduce((sum, entry) => sum + entry.size, 0);
					for (const [entry, value] of audioCache) {
						if (total <= MAX_CACHE_BYTES && audioCache.size <= 64) break;
						audioCache.delete(entry);
						total -= value.size;
					}
				}),
			),
		);
	});
}

export function transcribe(audio: Blob, language: Language) {
	return request(`/api/speech/transcribe?language=${language}`, 128 * 1024, {
		method: "POST",
		body: audio,
		headers: { "Content-Type": audio.type },
	}).pipe(
		Effect.flatMap((response) => parseJSON(response.bytes)),
		Effect.flatMap(Schema.decodeUnknownEffect(Transcript)),
		Effect.map((value) => value.text.trim() || null),
		Effect.mapError((error) =>
			error instanceof AppError
				? error
				: new AppError({
						code: "provider",
						status: 502,
						message: "The service returned an invalid transcript.",
					}),
		),
	);
}
