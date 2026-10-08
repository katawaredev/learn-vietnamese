import { Effect, Schema } from "effect";
import {
	Language,
	MAX_AUDIO_BYTES,
	SynthesisRequest,
	Transcript,
} from "~/features/speech/contracts";
import { AppError } from "~/lib/app-error";
import { requireEndpoint, synthesisKind } from "./config";
import { providerBody, providerRequest, readBody, readJson } from "./http";

export function synthesize(request: Request) {
	return Effect.gen(function* () {
		const input = yield* Schema.decodeUnknownEffect(SynthesisRequest)(
			yield* readJson(request),
		).pipe(
			Effect.mapError(
				() =>
					new AppError({
						code: "validation",
						status: 400,
						message: "Enter up to 4096 characters and a supported language.",
					}),
			),
		);
		const config = yield* requireEndpoint(synthesisKind(input.language));
		const response = yield* providerRequest(config, "audio/speech", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				input: input.text,
				model: config.model,
				voice: config.voice,
				response_format: "wav",
			}),
		});
		const bytes = yield* providerBody(response, MAX_AUDIO_BYTES);
		const type = response.headers.get("content-type")?.split(";")[0] ?? "";
		if (!bytes.length || !/^(audio\/|application\/octet-stream$)/.test(type)) {
			return yield* Effect.fail(
				new AppError({
					code: "provider",
					status: 502,
					message: "The speech service returned invalid audio.",
				}),
			);
		}
		return new Response(bytes, {
			headers: {
				"Content-Type": type === "application/octet-stream" ? "audio/wav" : type,
				"Cache-Control": "private, no-store",
			},
		});
	});
}

const AUDIO_TYPES = new Map([
	["audio/webm", "webm"],
	["audio/ogg", "ogg"],
	["audio/mp4", "mp4"],
	["audio/wav", "wav"],
	["audio/x-wav", "wav"],
	["audio/mpeg", "mp3"],
]);

export function transcribe(request: Request) {
	return Effect.gen(function* () {
		const language = yield* Schema.decodeUnknownEffect(Language)(
			new URL(request.url).searchParams.get("language"),
		).pipe(
			Effect.mapError(
				() =>
					new AppError({
						code: "validation",
						status: 400,
						message: "Unsupported transcription language.",
					}),
			),
		);
		const type = request.headers.get("content-type")?.split(";")[0].trim() ?? "";
		const extension = AUDIO_TYPES.get(type);
		if (!extension)
			return yield* Effect.fail(
				new AppError({ code: "validation", status: 415, message: "Unsupported recording format." }),
			);
		const bytes = yield* readBody(request, MAX_AUDIO_BYTES);
		if (!bytes.length)
			return yield* Effect.fail(
				new AppError({ code: "validation", status: 400, message: "No audio was recorded." }),
			);
		const config = yield* requireEndpoint("STT");
		const form = new FormData();
		form.set("file", new Blob([bytes], { type }), `recording.${extension}`);
		form.set("model", config.model);
		form.set("language", language === "vn" ? "vi" : "en");
		form.set("response_format", "json");
		const response = yield* providerRequest(config, "audio/transcriptions", {
			method: "POST",
			body: form,
		});
		const bytesJSON = yield* providerBody(response, 128 * 1024);
		const body = yield* Effect.try({
			try: (): unknown => JSON.parse(new TextDecoder().decode(bytesJSON)),
			catch: () =>
				new AppError({
					code: "provider",
					status: 502,
					message: "The transcription service returned invalid JSON.",
				}),
		});
		const result = yield* Schema.decodeUnknownEffect(Transcript)(body).pipe(
			Effect.mapError(
				() =>
					new AppError({
						code: "provider",
						status: 502,
						message: "The transcription service returned an invalid transcript.",
					}),
			),
		);
		return Response.json({ text: result.text.trim() });
	});
}
