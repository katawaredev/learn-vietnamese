import type { LocalResponse } from "./protocol";

export type Reply = (response: LocalResponse) => void;
export async function modelFile(
	url: string,
	requestId: string,
	reply: Reply,
	limit = 512 * 1024 * 1024,
) {
	let cache: Cache | undefined;
	try {
		cache = await caches.open("local-speech-models-v1");
		const saved = await cache.match(url);
		if (saved) {
			const bytes = await saved.arrayBuffer();
			if (bytes.byteLength <= limit) return bytes;
			await cache.delete(url);
		}
	} catch {
		/* Caching is optional, including in private browsing. */
	}
	const response = await fetch(url);
	if (!response.ok || !response.body) throw new Error("Could not download local speech model.");
	const total = Number(response.headers.get("content-length"));
	if (total > limit) throw new Error("Model file exceeds the download limit.");
	const reader = response.body.getReader();
	const chunks: Uint8Array<ArrayBuffer>[] = [];
	let loaded = 0;
	try {
		while (true) {
			// oxlint-disable-next-line no-await-in-loop -- Streamed bytes must be consumed in order.
			const chunk = await reader.read();
			if (chunk.done) break;
			loaded += chunk.value.length;
			if (loaded > limit) throw new Error("Model file exceeds the download limit.");
			chunks.push(chunk.value);
			reply({
				requestId,
				type: "progress",
				file: url,
				progress: total > 0 ? (loaded / total) * 100 : 0,
			});
		}
	} finally {
		await reader.cancel();
		reader.releaseLock();
	}
	const blob = new Blob(chunks);
	try {
		await cache?.put(url, new Response(blob));
	} catch {
		/* Storage quotas must not prevent inference. */
	}
	return blob.arrayBuffer();
}
