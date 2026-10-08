import { afterEach, describe, expect, it } from "vite-plus/test";
import { savedSettings, STORAGE_KEY } from "./preferences";

afterEach(() => localStorage.clear());
describe("speech preference migration", () => {
	it("restores the original local voices and listeners", () => {
		localStorage.setItem("tts-vn-voice", "vi_VN-vais1000-medium");
		localStorage.setItem("stt-vn-model", "phowhisper-small");
		localStorage.setItem("stt-en-model", "whisper-en-medium");
		const saved = savedSettings(localStorage);
		expect(saved?.preferences.tts.vn).toBe("local");
		expect(saved?.models.tts.vn).toBe("vi_VN-vais1000-medium");
		expect(saved?.models.stt.vn).toBe("phowhisper-small");
		expect(saved?.models.stt.en).toBe("whisper-medium");
	});
	it("preserves newer server/browser choices ahead of old preferences", () => {
		localStorage.setItem("tts-vn-voice", "Xenova/mms-tts-vie");
		localStorage.setItem(
			"speech-preferences-v2",
			JSON.stringify({
				tts: { vn: "server", en: "browser" },
				stt: { vn: "browser", en: "server" },
			}),
		);
		expect(savedSettings(localStorage)?.preferences.tts.vn).toBe("server");
	});
	it("recovers from invalid preferences and unavailable storage", () => {
		localStorage.setItem(STORAGE_KEY, "invalid");
		expect(savedSettings(localStorage)).toBeNull();
		expect(
			savedSettings({
				getItem: () => {
					throw new Error("Storage denied");
				},
			}),
		).toBeNull();
	});
});
