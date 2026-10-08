import { Effect } from "effect";

export function readBytes(body: Request | Response, maximum: number) {
	return Effect.tryPromise({
		try: async (signal) => {
			if (Number(body.headers.get("content-length")) > maximum) throw new Error("too-large");
			const reader = body.body?.getReader();
			if (!reader) return new Uint8Array();
			const cancel = () => {
				void reader.cancel().catch(() => {});
			};
			signal.addEventListener("abort", cancel, { once: true });
			const chunks: Uint8Array[] = [];
			let length = 0;
			try {
				while (!signal.aborted) {
					// ReadableStream allows one ordered read at a time.
					// oxlint-disable-next-line no-await-in-loop
					const { done, value } = await reader.read();
					if (done) break;
					length += value.length;
					if (length > maximum) throw new Error("too-large");
					chunks.push(value);
				}
				const bytes = new Uint8Array(length);
				let offset = 0;
				for (const chunk of chunks) {
					bytes.set(chunk, offset);
					offset += chunk.length;
				}
				return bytes;
			} finally {
				signal.removeEventListener("abort", cancel);
				await reader.cancel().catch(() => {});
				reader.releaseLock();
			}
		},
		catch: (error) => error,
	});
}
