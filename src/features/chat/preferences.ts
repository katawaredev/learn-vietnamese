import { Schema } from "effect";
import { DEFAULT_CHAT_MODEL } from "./catalog";

export const CHAT_STORAGE_KEY = "conversation-settings-v1";
export const ChatPreferences = Schema.Struct({
	backend: Schema.Literals(["local", "server"]),
	model: Schema.NonEmptyString,
	thinking: Schema.Boolean,
});
export type ChatPreferences = typeof ChatPreferences.Type;
export const DEFAULT_CHAT_PREFERENCES: ChatPreferences = {
	backend: "local",
	model: DEFAULT_CHAT_MODEL,
	thinking: false,
};

export function savedChatPreferences(storage?: Pick<Storage, "getItem">): ChatPreferences | null {
	try {
		const value = (storage ?? localStorage).getItem(CHAT_STORAGE_KEY);
		return value ? Schema.decodeUnknownSync(ChatPreferences)(JSON.parse(value)) : null;
	} catch {
		return null;
	}
}
export function persistChatPreferences(value: ChatPreferences) {
	try {
		localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(value));
	} catch {
		/* Storage is optional. */
	}
}
