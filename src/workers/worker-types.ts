/**
 * Shared types for Web Workers using @huggingface/transformers and @diffusionstudio/vits-web
 */

/**
 * Progress update during model loading — used by STT workers (no requestId needed
 * because the STT pool processes one request at a time and correlates by state).
 */
export interface STTProgressResponse {
	status: "progress";
	file?: string; // File being loaded
	progress: number; // Percentage (0-100)
	loaded: number; // Bytes loaded
	total: number; // Total bytes
}

/**
 * Progress update during model loading or inference — used by TTS workers.
 * Includes requestId so the pool can correlate responses to queued requests.
 */
export interface TTSProgressResponse {
	status: "progress";
	requestId: string;
	url?: string; // URL/file being loaded
	progress: number; // Percentage (0-100)
	loaded: number; // Bytes loaded
	total: number; // Total bytes
}

/**
 * @deprecated Use STTProgressResponse or TTSProgressResponse instead.
 * Kept for backwards compatibility during migration.
 */
export type ProgressResponse = STTProgressResponse | TTSProgressResponse;

/**
 * Error response from a worker — used by all workers.
 * requestId is required for TTS workers (pool needs to match to active request),
 * optional for STT workers (pool tracks state without an ID).
 */
export interface ErrorResponse {
	status: "error";
	error: string;
	requestId?: string;
}

/**
 * Standard worker status types
 */
export type WorkerStatus = "progress" | "ready" | "complete" | "error";

/**
 * ONNX model precision/quantization variants supported by transformers.js.
 * Mirrors the `DataType` union from `@huggingface/transformers` so provider
 * and worker files can share the same type without importing the ML library.
 */
export type ModelDType =
	| "auto"
	| "fp32"
	| "fp16"
	| "q8"
	| "int8"
	| "uint8"
	| "q4"
	| "bnb4"
	| "q4f16";
