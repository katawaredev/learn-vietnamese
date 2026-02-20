/**
 * Persistent IndexedDB cache for Vietnamese TTS audio blobs.
 *
 * Schema:
 *   key:   text string (the phrase that was synthesised)
 *   value: Record<voiceId, Blob>  — one Blob per voice that has generated this phrase
 *
 * Rationale for this layout: keeping all voices under a single text key means
 * 100 cached phrases = 100 IDB entries regardless of how many voices are tried.
 * Switching back to a previously-used voice still gets a cache hit.
 *
 * Only Vietnamese TTS is persisted. English audio (used only in the throwaway
 * conversation route) is intentionally excluded.
 *
 * All functions fail silently so IDB unavailability (private browsing, quota
 * exceeded) never breaks audio generation.
 */

const DB_NAME = "tts-audio-cache";
const STORE_NAME = "audio";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
	if (!dbPromise) {
		dbPromise = new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = () => {
				req.result.createObjectStore(STORE_NAME);
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => {
				dbPromise = null; // allow retry on next call
				reject(req.error);
			};
		});
	}
	return dbPromise;
}

/**
 * Returns the cached Blob for a (text, voiceId) pair, or null on miss / error.
 */
export async function getVoiceAudio(
	text: string,
	voiceId: string,
): Promise<Blob | null> {
	try {
		const db = await openDB();
		return new Promise((resolve, reject) => {
			const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(text);
			req.onsuccess = () =>
				resolve(
					(req.result as Record<string, Blob> | undefined)?.[voiceId] ?? null,
				);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return null;
	}
}

/**
 * Persists a generated audio Blob under (text, voiceId).
 * Merges into any existing entry for the same text so other voices are kept.
 */
export async function saveVoiceAudio(
	text: string,
	voiceId: string,
	blob: Blob,
): Promise<void> {
	try {
		const db = await openDB();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);
			const getReq = store.get(text);
			getReq.onsuccess = () => {
				const existing = (getReq.result ?? {}) as Record<string, Blob>;
				const putReq = store.put({ ...existing, [voiceId]: blob }, text);
				putReq.onsuccess = () => resolve();
				putReq.onerror = () => reject(putReq.error);
			};
			getReq.onerror = () => reject(getReq.error);
		});
	} catch {
		// IDB unavailable — fail silently, in-memory cache still works
	}
}

/**
 * Clears all persisted TTS audio and deletes the IndexedDB database entirely.
 * Intended for use in a settings UI "nuclear" clear option.
 */
export async function clearAudioCache(): Promise<void> {
	try {
		// Close any open connection first
		if (dbPromise) {
			const db = await dbPromise.catch(() => null);
			db?.close();
			dbPromise = null;
		}
		await new Promise<void>((resolve) => {
			const req = indexedDB.deleteDatabase(DB_NAME);
			req.onsuccess = () => resolve();
			req.onerror = () => resolve(); // fail silently
			req.onblocked = () => resolve(); // fail silently
		});
	} catch {
		// fail silently
	}
}
