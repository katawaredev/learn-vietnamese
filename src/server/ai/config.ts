import { Effect, Schema } from "effect";
import { AppError } from "~/lib/app-error";
import type { Capabilities, Language } from "~/features/speech/contracts";

const Endpoint = Schema.Struct({
	baseURL: Schema.String.check(
		Schema.makeFilter((value) => {
			try {
				const url = new URL(value);
				return (
					["https:", "http:"].includes(url.protocol) &&
					!url.username &&
					!url.password &&
					!url.search &&
					!url.hash
				);
			} catch {
				return false;
			}
		}),
	),
	model: Schema.NonEmptyString,
	apiKey: Schema.optional(Schema.String),
	voice: Schema.optional(Schema.NonEmptyString),
});
export type Endpoint = typeof Endpoint.Type;
type Environment = Record<string, string | undefined>;

export function readEndpoint(
	kind: "CHAT" | "STT" | "TTS_VN" | "TTS_EN",
	source: Environment = process.env,
) {
	return Effect.gen(function* () {
		const prefix = `AI_${kind}`;
		const baseURL = source[`${prefix}_BASE_URL`]?.trim();
		const model = source[`${prefix}_MODEL`]?.trim();
		if (!baseURL && !model) return null;
		const config = yield* Schema.decodeUnknownEffect(Endpoint)({
			baseURL,
			model,
			apiKey: source[`${prefix}_API_KEY`] || undefined,
			voice: source[`${prefix}_VOICE`]?.trim() || undefined,
		}).pipe(
			Effect.mapError(
				() =>
					new AppError({
						code: "configuration",
						status: 503,
						message: `${prefix}_BASE_URL and ${prefix}_MODEL must be configured correctly.`,
					}),
			),
		);
		if (kind.startsWith("TTS_") && !config.voice) {
			return yield* Effect.fail(
				new AppError({
					code: "configuration",
					status: 503,
					message: `${prefix}_VOICE is required.`,
				}),
			);
		}
		return config;
	});
}

export function requireEndpoint(kind: "CHAT" | "STT" | "TTS_VN" | "TTS_EN") {
	return readEndpoint(kind).pipe(
		Effect.flatMap((config) =>
			config
				? Effect.succeed(config)
				: Effect.fail(
						new AppError({
							code: "configuration",
							status: 503,
							message:
								"This service is not configured. Choose browser speech or configure the server.",
						}),
					),
		),
	);
}

export function synthesisKind(language: Language) {
	return language === "vn" ? ("TTS_VN" as const) : ("TTS_EN" as const);
}

export const capabilities = Effect.gen(function* () {
	const available = (kind: Parameters<typeof readEndpoint>[0]) =>
		readEndpoint(kind).pipe(Effect.catchTag("AppError", () => Effect.succeed(null)));
	const [vn, en, stt, chat] = yield* Effect.all([
		available("TTS_VN"),
		available("TTS_EN"),
		available("STT"),
		available("CHAT"),
	]);
	return { tts: { vn: !!vn, en: !!en }, stt: !!stt, chat: !!chat } satisfies Capabilities;
});
