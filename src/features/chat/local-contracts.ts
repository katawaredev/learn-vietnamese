import { Schema } from "effect";
import { ChatRequest } from "./contracts";

export const LocalChatRequest = Schema.Struct({
	requestId: Schema.String,
	model: Schema.String,
	input: ChatRequest,
});
export const LocalChatEvent = Schema.Union([
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("status"),
		state: Schema.Literals(["loading", "working"]),
		message: Schema.String,
	}),
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("delta"),
		content: Schema.String,
	}),
	Schema.Struct({ requestId: Schema.String, type: Schema.Literal("done") }),
	Schema.Struct({
		requestId: Schema.String,
		type: Schema.Literal("error"),
		message: Schema.String,
	}),
]);
export type LocalChatEvent = typeof LocalChatEvent.Type;
