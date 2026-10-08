import { Effect, type Scope } from "effect";
import { AppError } from "~/lib/app-error";
import { readBytes } from "~/lib/http-body";
import type { Endpoint } from "./config";

export function providerRequest(config: Endpoint, path: string, init: RequestInit) {
	return Effect.gen(function* () {
		const controller = yield* Effect.acquireRelease(
			Effect.sync(() => new AbortController()),
			(value) => Effect.sync(() => value.abort()),
		);
		const headers = new Headers(init.headers);
		if (config.apiKey) headers.set("Authorization", `Bearer ${config.apiKey}`);
		return yield* Effect.tryPromise({
			try: () =>
				fetch(`${config.baseURL.replace(/\/+$/, "")}/${path}`, {
					...init,
					signal: controller.signal,
					redirect: "error",
					headers,
				}),
			catch: () =>
				new AppError({
					code: "unavailable",
					status: 502,
					message: "The AI service could not be reached.",
				}),
		}).pipe(
			Effect.flatMap((response) =>
				response.ok
					? Effect.succeed(response)
					: Effect.fail(
							new AppError({
								code: "provider",
								status: response.status === 429 ? 429 : 502,
								message:
									response.status === 429
										? "The AI service is busy. Please try again shortly."
										: "The AI service rejected the request.",
							}),
						),
			),
		);
	});
}

export function readBody(request: Request, maximum: number) {
	return readBytes(request, maximum).pipe(
		Effect.mapError(
			(error) =>
				new AppError({
					code: "validation",
					status: error instanceof Error && error.message === "too-large" ? 413 : 400,
					message: "The request is empty, invalid, or too large.",
				}),
		),
	);
}

export function providerBody(response: Response, maximum: number) {
	return readBytes(response, maximum).pipe(
		Effect.mapError(
			() =>
				new AppError({
					code: "provider",
					status: 502,
					message: "The AI service returned an invalid or oversized response.",
				}),
		),
	);
}

export function readJson(request: Request) {
	return readBody(request, 128 * 1024).pipe(
		Effect.flatMap((bytes) =>
			Effect.try({
				try: (): unknown => JSON.parse(new TextDecoder().decode(bytes)),
				catch: () =>
					new AppError({ code: "validation", status: 400, message: "Invalid JSON request." }),
			}),
		),
	);
}

export function respond(
	program: Effect.Effect<Response, AppError, Scope.Scope>,
	signal?: AbortSignal,
) {
	return Effect.runPromise(
		Effect.scoped(program).pipe(
			Effect.timeout("90 seconds"),
			Effect.catchTag("TimeoutError", () =>
				Effect.succeed(
					Response.json(
						{ error: { code: "unavailable", message: "The AI service timed out." } },
						{ status: 504 },
					),
				),
			),
			Effect.catchTag("AppError", (error) =>
				Effect.succeed(
					Response.json(
						{ error: { code: error.code, message: error.message } },
						{ status: error.status },
					),
				),
			),
		),
		{ signal },
	);
}
