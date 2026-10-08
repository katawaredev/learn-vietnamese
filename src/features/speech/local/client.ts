import { Effect, Schema } from "effect";
import { AppError } from "~/lib/app-error";
import { browserResource } from "~/lib/browser-resource";
import { MAX_AUDIO_BYTES, type Language } from "../contracts";
import { findLocalModel, type SpeechKind } from "./catalog";
import { LocalResponse, LocalRequest, type LocalCommand } from "./protocol";

export interface LocalStatus {
	model: string;
	state: "idle" | "loading" | "working" | "ready" | "error";
	file?: string;
	progress?: number;
	error?: string;
}
type Pending = { finish: (response: LocalResponse) => void; fail: (error: AppError) => void };
interface Session {
	worker: Worker;
	model: string;
	pending: Map<string, Pending>;
}
const sessions = new Map<string, Session>();
const subscribers = new Set<() => void>();
let statuses: Readonly<Record<string, LocalStatus>> = {};
export const getLocalStatuses = () => statuses;
export const subscribeLocalStatuses = (listener: () => void) => {
	subscribers.add(listener);
	return () => {
		subscribers.delete(listener);
	};
};
const localError = (message: string) => new AppError({ code: "unavailable", status: 0, message });
const slot = (kind: SpeechKind, language: Language) => `${kind}:${language}`;
function status(key: string, value: LocalStatus) {
	statuses = { ...statuses, [key]: value };
	for (const listener of subscribers) listener();
}

export function releaseLocalModel(kind: SpeechKind, language: Language) {
	const key = slot(kind, language);
	const session = sessions.get(key);
	if (!session) return;
	sessions.delete(key);
	session.worker.terminate();
	for (const request of session.pending.values())
		request.fail(localError("Local speech was cancelled because the model changed."));
	session.pending.clear();
	status(key, { model: session.model, state: "idle" });
}
export function releaseAllLocalModels() {
	for (const kind of ["tts", "stt"] as const)
		for (const language of ["vn", "en"] as const) releaseLocalModel(kind, language);
}

// Only worker entry points import inference packages. SSR and the initial UI import metadata.
export function selectLocalModel(kind: SpeechKind, language: Language, id: string) {
	const model = findLocalModel(kind, id);
	if (!model || !model.languages.includes(language))
		throw localError("Unknown local speech model.");
	if (typeof Worker === "undefined")
		throw localError("Local AI speech requires Web Worker support.");
	const key = slot(kind, language);
	const current = sessions.get(key);
	if (current?.model === id) return current;
	releaseLocalModel(kind, language);
	const worker =
		model.engine === "kokoro"
			? new Worker(new URL("./kokoro.worker.ts", import.meta.url), { type: "module" })
			: model.engine === "vieneu"
				? new Worker(new URL("./vieneu.worker.ts", import.meta.url), { type: "module" })
				: model.engine === "piper"
					? new Worker(new URL("./piper.worker.ts", import.meta.url), { type: "module" })
					: new Worker(new URL("./transformers.worker.ts", import.meta.url), { type: "module" });
	const session: Session = { worker, model: id, pending: new Map() };
	sessions.set(key, session);
	status(key, { model: id, state: "idle" });
	worker.addEventListener("message", (event: MessageEvent<unknown>) => {
		if (sessions.get(key) !== session) return;
		const parsed = Schema.decodeUnknownOption(LocalResponse)(event.data);
		if (parsed._tag === "None") {
			failSession("Local model returned an invalid response.");
			return;
		}
		const response = parsed.value;
		const request = session.pending.get(response.requestId);
		if (!request) return;
		if (response.type === "working") {
			status(key, { model: id, state: "working" });
			return;
		}
		if (response.type === "progress") {
			status(key, {
				model: id,
				state: "loading",
				file: response.file.split("/").at(-1),
				progress: Math.max(0, Math.min(100, response.progress)),
			});
			return;
		}
		session.pending.delete(response.requestId);
		if (response.type === "error") {
			request.fail(localError(response.message));
			failSession(response.message);
		} else {
			status(key, { model: id, state: "ready" });
			request.finish(response);
		}
	});
	const failSession = (message: string) => {
		if (sessions.get(key) !== session) return;
		const pending = [...session.pending.values()];
		session.pending.clear();
		worker.terminate();
		sessions.delete(key);
		status(key, { model: id, state: "error", error: message });
		for (const request of pending) request.fail(localError(message));
	};
	worker.addEventListener("error", () =>
		failSession("Could not start the local model. Try reloading or select another model."),
	);
	worker.addEventListener("messageerror", () =>
		failSession("Could not receive the local model result."),
	);
	return session;
}

function run(kind: SpeechKind, language: Language, request: LocalCommand) {
	return browserResource<LocalResponse, AppError>((resume) => {
		const requestId = crypto.randomUUID();
		let message: LocalRequest;
		try {
			message = Schema.decodeUnknownSync(LocalRequest)({ ...request, requestId });
		} catch {
			resume(Effect.fail(localError("Invalid local speech input.")));
			return undefined;
		}
		let session: Session;
		try {
			session = selectLocalModel(kind, language, request.model);
		} catch (error) {
			resume(
				Effect.fail(
					error instanceof AppError
						? error
						: localError("Could not load the local speech runtime."),
				),
			);
			return undefined;
		}
		session.pending.set(requestId, {
			finish: (response) => resume(Effect.succeed(response)),
			fail: (error) => resume(Effect.fail(error)),
		});
		status(slot(kind, language), { model: request.model, state: "loading" });
		try {
			session.worker.postMessage(message);
		} catch {
			session.pending.delete(requestId);
			releaseLocalModel(kind, language);
			resume(Effect.fail(localError("Invalid local speech input or worker unavailable.")));
		}
		return () => {
			// ONNX generation has no reliable per-call abort. Termination stops downloads and CPU work.
			if (session.pending.has(requestId) && sessions.get(slot(kind, language)) === session)
				releaseLocalModel(kind, language);
		};
	}).pipe(
		Effect.timeout("10 minutes"),
		Effect.mapError((error) =>
			error instanceof AppError
				? error
				: localError("The local model timed out. Choose a smaller model or retry."),
		),
	);
}

export function synthesizeLocal(text: string, language: Language, model: string) {
	return run("tts", language, { type: "synthesize", model, text: text.trim(), language }).pipe(
		Effect.flatMap((result) =>
			result.type === "audio" &&
			result.audio.type.startsWith("audio/") &&
			result.audio.size > 0 &&
			result.audio.size <= MAX_AUDIO_BYTES
				? Effect.succeed(result.audio)
				: Effect.fail(localError("Local synthesis returned invalid audio.")),
		),
	);
}

export function transcribeLocal(
	audio: Float32Array<ArrayBuffer>,
	language: Language,
	model: string,
) {
	return run("stt", language, { type: "transcribe", model, audio, language }).pipe(
		Effect.flatMap((result) =>
			result.type === "transcript"
				? Effect.succeed(result.text.trim() || null)
				: Effect.fail(localError("Local recognition returned an invalid transcript.")),
		),
	);
}
