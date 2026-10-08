import { Data, Schema } from "effect";

export class AppError extends Data.TaggedError("AppError")<{
	readonly code: "validation" | "configuration" | "unavailable" | "provider" | "permission";
	readonly message: string;
	readonly status: number;
}> {}

export const ErrorResponse = Schema.Struct({
	error: Schema.Struct({ code: Schema.String, message: Schema.String }),
});

export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
