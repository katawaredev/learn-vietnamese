import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { SpeakBaseButton } from "./SpeakBaseButton";

function createAudio() {
	const audio = new Audio();
	const play = vi.spyOn(audio, "play").mockImplementation(() => {
		audio.dispatchEvent(new Event("play"));
		return Promise.resolve();
	});
	const pause = vi.spyOn(audio, "pause").mockImplementation(() => {});
	return { audio, play, pause };
}

function createPendingAudio() {
	let resolve: (audio: HTMLAudioElement) => void = () => {};
	const promise = new Promise<HTMLAudioElement>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

describe("SpeakBaseButton", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal("PointerEvent", MouseEvent);
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("plays on keyboard activation and stops on a second activation", async () => {
		const { audio, play, pause } = createAudio();
		const { getByRole } = render(
			<SpeakBaseButton getAudio={() => Promise.resolve(audio)} canPlay={() => true} />,
		);
		await act(async () => {
			fireEvent.click(getByRole("button", { name: "Play audio" }), { detail: 0 });
			await Promise.resolve();
		});
		expect(play).toHaveBeenCalledOnce();
		expect(audio.playbackRate).toBe(0.8);
		fireEvent.click(getByRole("button", { name: "Stop audio" }), { detail: 0 });
		expect(pause).toHaveBeenCalledOnce();
		expect(getByRole("button", { name: "Play audio" })).toBeDefined();
	});

	it("starts a held press slowly and keeps playing after release", async () => {
		const { audio, play, pause } = createAudio();
		const { getByRole } = render(
			<SpeakBaseButton getAudio={() => Promise.resolve(audio)} canPlay={() => true} />,
		);
		const button = getByRole("button");
		fireEvent.pointerDown(button, { button: 0 });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(200);
		});
		expect(audio.playbackRate).toBe(0.5);
		fireEvent.pointerUp(button);
		fireEvent.click(button, { detail: 1 });
		expect(audio.playbackRate).toBe(0.8);
		expect(play).toHaveBeenCalledOnce();
		expect(pause).not.toHaveBeenCalled();
	});

	it("uses the released speed when audio generation finishes later", async () => {
		const { audio } = createAudio();
		const pending = createPendingAudio();
		const { getByRole } = render(
			<SpeakBaseButton getAudio={() => pending.promise} canPlay={() => true} />,
		);
		const button = getByRole("button");
		fireEvent.pointerDown(button, { button: 0 });
		await act(() => vi.advanceTimersByTimeAsync(200));
		fireEvent.pointerUp(button);
		await act(() => {
			pending.resolve(audio);
			return pending.promise;
		});
		expect(audio.playbackRate).toBe(0.8);
	});

	it("does not play audio that resolves after unmount", async () => {
		const { audio, play } = createAudio();
		const pending = createPendingAudio();
		const { getByRole, unmount } = render(
			<SpeakBaseButton getAudio={() => pending.promise} canPlay={() => true} />,
		);
		fireEvent.click(getByRole("button"));
		unmount();
		await act(() => {
			pending.resolve(audio);
			return pending.promise;
		});
		expect(play).not.toHaveBeenCalled();
	});

	it("cancels a pending hold on pointer cancellation or unmount", async () => {
		const getAudio = vi.fn(() => new Promise<HTMLAudioElement>(() => {}));
		const { getByRole, unmount } = render(
			<SpeakBaseButton getAudio={getAudio} canPlay={() => true} />,
		);
		const button = getByRole("button");
		fireEvent.pointerDown(button, { button: 0 });
		fireEvent.pointerCancel(button);
		await act(() => vi.advanceTimersByTimeAsync(200));
		expect(getAudio).not.toHaveBeenCalled();
		fireEvent.pointerDown(button, { button: 0 });
		unmount();
		await act(() => vi.advanceTimersByTimeAsync(200));
		expect(getAudio).not.toHaveBeenCalled();
	});
});
