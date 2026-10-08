import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { Effect } from "effect";
import {
	getLocalStatuses,
	releaseAllLocalModels,
	selectLocalModel,
	synthesizeLocal,
	transcribeLocal,
} from "./client";

class FakeWorker extends EventTarget {
	static instances: FakeWorker[] = [];
	postMessage = vi.fn();
	terminate = vi.fn();
	constructor(readonly url: URL) {
		super();
		FakeWorker.instances.push(this);
	}
	reply(value: unknown) {
		this.dispatchEvent(new MessageEvent("message", { data: value }));
	}
}
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
beforeEach(() => {
	FakeWorker.instances = [];
	vi.stubGlobal("Worker", FakeWorker);
});
afterEach(() => {
	releaseAllLocalModels();
	vi.unstubAllGlobals();
});

describe("local model lifecycles", () => {
	it("loads only the selected engine and downloads no model until an operation", () => {
		expect(FakeWorker.instances).toHaveLength(0);
		selectLocalModel("tts", "vn", "vi_VN-vivos-x_low");
		const worker = FakeWorker.instances[0];
		expect(worker.url.pathname).toContain("piper.worker.ts");
		expect(worker.postMessage).not.toHaveBeenCalled();
		selectLocalModel("tts", "vn", "vi_VN-vivos-x_low");
		expect(FakeWorker.instances).toHaveLength(1);
		selectLocalModel("tts", "vn", "Xenova/mms-tts-vie");
		expect(worker.terminate).toHaveBeenCalledOnce();
		expect(FakeWorker.instances[1].url.pathname).toContain("transformers.worker.ts");
	});
	it("isolates the new voice runtimes from Transformers and Piper", () => {
		selectLocalModel("tts", "vn", "kokoro-diem_trinh");
		expect(FakeWorker.instances[0].url.pathname).toContain("kokoro.worker.ts");
		selectLocalModel("tts", "vn", "vieneu-minh_quan_pro");
		expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
		expect(FakeWorker.instances[1].url.pathname).toContain("vieneu.worker.ts");
		expect(FakeWorker.instances[1].postMessage).not.toHaveBeenCalled();
	});

	it("keeps a successful model warm, validates audio, and reports download progress", async () => {
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		const operation = Effect.runPromise(synthesizeLocal("Xin chào", "vn", "Xenova/mms-tts-vie"));
		await tick();
		const worker = FakeWorker.instances[0];
		const request = worker.postMessage.mock.calls[0][0] as { requestId: string; text: string };
		expect(request.text).toBe("Xin chào");
		worker.reply({
			requestId: request.requestId,
			type: "progress",
			file: "onnx/model.onnx",
			progress: 35,
		});
		expect(getLocalStatuses()["tts:vn"].progress).toBe(35);
		worker.reply({
			requestId: request.requestId,
			type: "audio",
			audio: new Blob(["wav"], { type: "audio/wav" }),
		});
		expect((await operation).size).toBe(3);
		expect(worker.terminate).not.toHaveBeenCalled();
		expect(fetch).not.toHaveBeenCalled();
	});
	it("terminates downloads and inference on cancellation", async () => {
		const controller = new AbortController();
		const operation = Effect.runPromise(synthesizeLocal("Xin chào", "vn", "Xenova/mms-tts-vie"), {
			signal: controller.signal,
		});
		const failure = expect(operation).rejects.toThrow();
		await tick();
		controller.abort();
		await failure;
		expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
		expect(getLocalStatuses()["tts:vn"].state).toBe("idle");
	});
	it("cancels the old operation when switching models and ignores stale failures", async () => {
		const operation = Effect.runPromise(synthesizeLocal("Xin chào", "vn", "Xenova/mms-tts-vie"));
		const failure = expect(operation).rejects.toThrow("model changed");
		await tick();
		const old = FakeWorker.instances[0];
		selectLocalModel("tts", "vn", "vi_VN-vivos-x_low");
		old.dispatchEvent(new Event("error"));
		await failure;
		expect(getLocalStatuses()["tts:vn"].model).toBe("vi_VN-vivos-x_low");
		expect(FakeWorker.instances[1].terminate).not.toHaveBeenCalled();
	});
	it("rejects malformed worker output and discards the failed model", async () => {
		const operation = Effect.runPromise(synthesizeLocal("Xin chào", "vn", "Xenova/mms-tts-vie"));
		const failure = expect(operation).rejects.toThrow("invalid response");
		await tick();
		FakeWorker.instances[0].reply({ type: "audio", audio: "not a blob" });
		await failure;
		expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
	});
	it("transcribes locally without an HTTP call and treats empty results as silence", async () => {
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		const operation = Effect.runPromise(
			transcribeLocal(new Float32Array(16_000), "vn", "phowhisper-tiny"),
		);
		await tick();
		const worker = FakeWorker.instances[0];
		const request = worker.postMessage.mock.calls[0][0] as { requestId: string; type: string };
		expect(request.type).toBe("transcribe");
		worker.reply({ requestId: request.requestId, type: "transcript", text: " " });
		expect(await operation).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
	it("rejects unknown or wrong-language models before starting a runtime", async () => {
		await expect(
			Effect.runPromise(synthesizeLocal("hello", "en", "Xenova/mms-tts-vie")),
		).rejects.toThrow("Unknown");
		await expect(
			Effect.runPromise(synthesizeLocal("hello", "en", "https://other/model")),
		).rejects.toThrow("Unknown");
		expect(FakeWorker.instances).toHaveLength(0);
	});
	it("rejects invalid synthesis input before loading a runtime", async () => {
		await expect(
			Effect.runPromise(synthesizeLocal(" ", "vn", "Xenova/mms-tts-vie")),
		).rejects.toThrow("Invalid local speech input");
		expect(FakeWorker.instances).toHaveLength(0);
	});
});
