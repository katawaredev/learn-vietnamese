import { Schema } from "effect";
import { Language, SynthesisRequest } from "../contracts";

const fields = { requestId: Schema.String, model: Schema.String };
export const LocalRequest = Schema.Union([
	Schema.Struct({ ...fields, type: Schema.Literal("load") }),
	Schema.Struct({
		...fields,
		type: Schema.Literal("synthesize"),
		text: SynthesisRequest.fields.text,
		language: Language,
	}),
	Schema.Struct({
		...fields,
		type: Schema.Literal("transcribe"),
		audio: Schema.instanceOf(Float32Array),
		language: Language,
	}),
]);
export type LocalRequest = typeof LocalRequest.Type;
type WithoutRequestId<T> = T extends { requestId: string } ? Omit<T, "requestId"> : never;
export type LocalCommand = WithoutRequestId<LocalRequest>;

export const LocalResponse = Schema.Union([
	Schema.Struct({ requestId: Schema.String, type: Schema.Literal("working") }),
	Schema.Struct({ requestId: Schema.String, type: Schema.Literal("ready") }),
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("audio"),
		audio: Schema.instanceOf(Blob),
	}),
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("transcript"),
		text: Schema.String,
	}),
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("progress"),
		file: Schema.String,
		progress: Schema.Number,
	}),
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("error"),
		message: Schema.String,
	}),
]);
export type LocalResponse = typeof LocalResponse.Type;
