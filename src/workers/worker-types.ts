/**
 * Shared types for Web Workers using @huggingface/transformers
 */

/**
 * Progress update from model loading/inference
 */
export interface ProgressResponse {
	status: "progress";
	file?: string; // File being loaded (STT)
	url?: string; // URL being loaded (TTS, legacy)
	progress: number; // Percentage (0-100)
	loaded: number; // Bytes loaded
	total: number; // Total bytes
	requestId?: string; // Request ID (for TTS)
}

/**
 * Error response from worker
 */
export interface ErrorResponse {
	status: "error";
	error: string;
	requestId?: string; // Request ID (for TTS)
}

/**
 * Standard worker status types
 */
export type WorkerStatus = "progress" | "ready" | "complete" | "error";
