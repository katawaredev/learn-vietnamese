import { Effect } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { playAudio, recognizeBrowser, recordAudio } from "./browser";

const trackStop = vi.fn();
const closeContext = vi.fn(() => Promise.resolve());
const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
let recorder: FakeRecorder;

class FakeRecorder {
	static isTypeSupported() {
		return true;
	}
	state = "inactive";
	mimeType = "audio/webm";
	onstop: (() => void) | null = null;
	onerror: (() => void) | null = null;
	ondataavailable: ((event: { data: Blob }) => void) | null = null;
	start() {
		this.state = "recording";
	}
	stop() {
		this.state = "inactive";
		this.ondataavailable?.({ data: new Blob(["audio"]) });
		this.onstop?.();
	}
}

beforeEach(() => {
	vi.useFakeTimers();
	recorder = new FakeRecorder();
	vi.stubGlobal(
		"MediaRecorder",
		Object.assign(
			vi.fn(function () {
				return recorder;
			}),
			{ isTypeSupported: () => true },
		),
	);
	vi.stubGlobal(
		"AudioContext",
		class {
			close = closeContext;
			createMediaStreamSource() {
				return { connect: () => {} };
			}
			createAnalyser() {
				return { fftSize: 512, getFloatTimeDomainData: (data: Float32Array) => data.fill(0) };
			}
		},
	);
	vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: () => Promise.resolve(stream) } });
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	vi.clearAllMocks();
	vi.useRealTimers();
});

describe("scoped browser media", () => {
	it("unlocks sound before slow synthesis and releases the context on cancellation", async () => {
		const events: string[] = [];
		const createSource = vi.fn();
		let complete: (blob: Blob) => void = () => {};
		vi.stubGlobal(
			"AudioContext",
			class {
				resume = () => {
					events.push("resume");
					return Promise.resolve();
				};
				createBufferSource = createSource;
				close = closeContext;
			},
		);
		const synthesis = Effect.promise(() => {
			events.push("synthesis");
			return new Promise<Blob>((resolve) => {
				complete = resolve;
			});
		});
		const controller = new AbortController();
		const pending = Effect.runPromise(
			playAudio(synthesis, 0.8, () => {}),
			{ signal: controller.signal },
		);
		const rejected = expect(pending).rejects.toThrow(/interrupt/i);
		await vi.advanceTimersByTimeAsync(1);
		expect(events).toEqual(["resume", "synthesis"]);
		controller.abort();
		await rejected;
		complete(new Blob(["late audio"]));
		await vi.advanceTimersByTimeAsync(1);
		expect(closeContext).toHaveBeenCalledOnce();
		expect(createSource).not.toHaveBeenCalled();
	});

	it("times out blocked autoplay before downloading a model", async () => {
		vi.stubGlobal(
			"AudioContext",
			class {
				resume = () => new Promise<void>(() => {});
				close = closeContext;
			},
		);
		const download = vi.fn(() => Promise.resolve(new Blob(["audio"])));
		const pending = Effect.runPromise(playAudio(Effect.promise(download), 0.8, () => {}));
		const rejected = expect(pending).rejects.toThrow("Your browser blocked sound");
		await vi.advanceTimersByTimeAsync(5001);
		await rejected;
		expect(download).not.toHaveBeenCalled();
		expect(closeContext).toHaveBeenCalledOnce();
	});

	it.each(["error", "abort"] as const)(
		"closes the audio context when decoding ends with %s",
		async (ending) => {
			let rejectDecode: (reason: Error) => void = () => {};
			const started = vi.fn();
			const createSource = vi.fn();
			vi.stubGlobal(
				"AudioContext",
				class {
					resume = () => Promise.resolve();
					decodeAudioData = () =>
						new Promise<AudioBuffer>((_resolve, reject) => {
							rejectDecode = reject;
						});
					createBufferSource = createSource;
					close = vi.fn(() => {
						void closeContext();
						rejectDecode(new DOMException("Decoding cancelled", "AbortError"));
						return Promise.resolve();
					});
				},
			);
			const controller = new AbortController();
			const blob = { arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) } as Blob;
			const pending = Effect.runPromise(playAudio(blob, 0.8, started), {
				signal: controller.signal,
			});
			const rejected = expect(pending).rejects.toThrow(
				ending === "error" ? "Could not decode" : /interrupt/i,
			);
			await vi.advanceTimersByTimeAsync(1);
			if (ending === "error") rejectDecode(new Error("Invalid audio"));
			else controller.abort();
			await rejected;
			await vi.advanceTimersByTimeAsync(1);
			expect(closeContext).toHaveBeenCalledOnce();
			expect(createSource).not.toHaveBeenCalled();
			expect(started).not.toHaveBeenCalled();
		},
	);

	it.each(["finish", "failure", "abort"] as const)(
		"releases tracks, timers, and Web Audio on %s",
		async (ending) => {
			const controller = new AbortController();
			let stop: () => void = () => {};
			const pending = Effect.runPromise(
				recordAudio((value) => {
					stop = value;
				}),
				{ signal: controller.signal },
			);
			const settled = pending.catch(() => null);
			await vi.advanceTimersByTimeAsync(1);
			if (ending === "finish") stop();
			if (ending === "failure") recorder.onerror?.();
			if (ending === "abort") controller.abort();
			await settled;
			expect(trackStop).toHaveBeenCalledOnce();
			expect(closeContext).toHaveBeenCalledOnce();
			expect(recorder.state).toBe("inactive");
			expect(recorder.onstop).toBeNull();
			expect(vi.getTimerCount()).toBe(0);
		},
	);

	it("stops a microphone whose permission resolves after cancellation", async () => {
		let grant: (value: MediaStream) => void = () => {};
		vi.stubGlobal("navigator", {
			mediaDevices: {
				getUserMedia: () =>
					new Promise<MediaStream>((resolve) => {
						grant = resolve;
					}),
			},
		});
		const controller = new AbortController();
		const pending = Effect.runPromise(
			recordAudio(() => {}),
			{ signal: controller.signal },
		).catch(() => null);
		controller.abort();
		await pending;
		grant(stream);
		await Promise.resolve();
		expect(trackStop).toHaveBeenCalledOnce();
	});

	it("finishes browser recognition with a transcript and releases its timer", async () => {
		class Recognition {
			onresult: ((event: unknown) => void) | null = null;
			onend: (() => void) | null = null;
			abort = vi.fn();
			start() {
				this.onresult?.({ results: [[{ transcript: " Xin chào " }]] });
				this.onend?.();
			}
		}
		vi.stubGlobal("SpeechRecognition", Recognition);
		expect(await Effect.runPromise(recognizeBrowser("vn", () => {}))).toBe("Xin chào");
		expect(vi.getTimerCount()).toBe(0);
	});

	it.each(["finish", "abort", "start failure"] as const)(
		"stops and disconnects playback and closes its context on %s",
		async (ending) => {
			const source = {
				onended: null as (() => void) | null,
				buffer: null as AudioBuffer | null,
				playbackRate: { value: 1 },
				connect: vi.fn(),
				disconnect: vi.fn(),
				stop: vi.fn(),
				start: vi.fn(() => {
					if (ending === "start failure") throw new Error("Unavailable");
				}),
			};
			vi.stubGlobal(
				"AudioContext",
				class {
					destination = {};
					resume = () => Promise.resolve();
					decodeAudioData = () => Promise.resolve({} as AudioBuffer);
					createBufferSource = () => source;
					close = closeContext;
				},
			);
			const controller = new AbortController();
			const blob = { arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) } as Blob;
			const started = vi.fn((setRate: (rate: number) => void) => setRate(0.5));
			const pending = Effect.runPromise(playAudio(blob, 0.8, started), {
				signal: controller.signal,
			});
			const settled =
				ending === "finish"
					? expect(pending).resolves.toBeUndefined()
					: expect(pending).rejects.toThrow(ending === "abort" ? /interrupt/i : "Could not start");
			await vi.advanceTimersByTimeAsync(1);
			if (ending === "finish") source.onended?.();
			if (ending === "abort") controller.abort();
			await settled;
			expect(source.stop).toHaveBeenCalledOnce();
			expect(source.disconnect).toHaveBeenCalledOnce();
			expect(closeContext).toHaveBeenCalledOnce();
			expect(source.onended).toBeNull();
			if (ending !== "start failure") {
				expect(started).toHaveBeenCalledOnce();
				expect(source.playbackRate.value).toBe(0.5);
			}
		},
	);
});
