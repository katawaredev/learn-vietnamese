import { Schema } from "effect";

export const Gender = Schema.Literals(["male", "female"]);
export const PersonType = Schema.Literals([
	"child",
	"teenager",
	"friend",
	"spouse",
	"mother-in-law",
	"father-in-law",
	"shopkeeper",
	"colleague",
	"elder",
	"younger",
]);
export const TranslationDirection = Schema.Literals(["en-to-vi", "vi-to-en"]);
export type Gender = typeof Gender.Type;
export type PersonType = typeof PersonType.Type;
export type TranslationDirection = typeof TranslationDirection.Type;

export const ChatRequest = Schema.Struct({
	messages: Schema.Array(
		Schema.Struct({
			id: Schema.NonEmptyString,
			role: Schema.Literals(["user", "assistant"]),
			content: Schema.String.check(Schema.isMaxLength(8192)),
		}),
	).check(Schema.isMinLength(1), Schema.isMaxLength(100)),
	mode: Schema.Literals(["practice", "translate"]),
	personType: Schema.optionalKey(PersonType),
	gender: Schema.optionalKey(Gender),
	direction: Schema.optionalKey(TranslationDirection),
	model: Schema.optionalKey(Schema.NonEmptyString.check(Schema.isMaxLength(200))),
	thinking: Schema.optionalKey(Schema.Boolean),
});
export type ChatRequest = typeof ChatRequest.Type;

export const ChatModels = Schema.Struct({
	models: Schema.Array(Schema.NonEmptyString),
	defaultModel: Schema.NullOr(Schema.NonEmptyString),
	thinking: Schema.Boolean,
});
export type ChatModels = typeof ChatModels.Type;
