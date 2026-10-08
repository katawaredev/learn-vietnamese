import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import type { Page } from "playwright";

// Opt-in network test: downloads public model weights, then runs inference in actual workers.
export async function checkLocalSpeech(
	page: Page,
	root: string,
	appURL: string,
	includeAdditional = false,
) {
	const assets = await readdir(`${root}/.output/public/assets`);
	const transformers = assets.find(
		(name) => name.startsWith("transformers.worker-") && name.endsWith(".js"),
	);
	const piper = assets.find((name) => name.startsWith("piper.worker-") && name.endsWith(".js"));
	const kokoro = assets.find((name) => name.startsWith("kokoro.worker-") && name.endsWith(".js"));
	const vieneu = assets.find((name) => name.startsWith("vieneu.worker-") && name.endsWith(".js"));
	assert(
		transformers && piper && kokoro && vieneu,
		"Build local model workers before running this check.",
	);
	page.on("console", (message) => {
		if (message.type() === "error") console.error(message.text());
		else if (message.text().startsWith("Checking local")) console.log(message.text());
	});
	const results = await page.evaluate(
		async ({ transformerURL, piperURL, kokoroURL, vieneuURL, additional }) => {
			const outputs: { model: string; samples?: number; text?: string }[] = [];
			async function infer(url: string, request: object): Promise<{ audio?: Blob; text?: string }> {
				const worker = new Worker(url, { type: "module" });
				try {
					return await new Promise((resolve, reject) => {
						const timer = setTimeout(
							() => reject(new Error("Local model smoke test timed out.")),
							600_000,
						);
						worker.onerror = (event) => {
							clearTimeout(timer);
							reject(new Error(`Local worker startup failed: ${event.message}`));
						};
						worker.onmessage = (
							event: MessageEvent<{ type: string; audio?: Blob; text?: string; message?: string }>,
						) => {
							if (event.data.type === "progress" || event.data.type === "working") return;
							clearTimeout(timer);
							if (event.data.type === "error") reject(new Error(event.data.message));
							else resolve(event.data);
						};
						worker.postMessage({ ...request, requestId: crypto.randomUUID() });
					});
				} finally {
					worker.terminate();
				}
			}
			async function synthesize(model: string, language: "vn" | "en", engineURL: string) {
				console.info("Checking local synthesis:", model);
				const response = await infer(engineURL, {
					type: "synthesize",
					model,
					language,
					text:
						language === "vn"
							? "Xin chào. Tôi đang học tiếng Việt."
							: "Hello. I am learning Vietnamese.",
				});
				if (!response.audio?.size) throw new Error(`No generated audio: ${model}`);
				const context = new AudioContext({ sampleRate: 16_000 });
				try {
					const audio = await context.decodeAudioData(await response.audio.arrayBuffer());
					const samples = new Float32Array(audio.getChannelData(0));
					if (!samples.some((value) => Math.abs(value) > 0.001))
						throw new Error(`Silent synthesis: ${model}`);
					outputs.push({ model, samples: samples.length });
					return samples;
				} finally {
					await context.close();
				}
			}
			const vietnamese = await synthesize(
				additional ? "kokoro-diem_trinh" : "Xenova/mms-tts-vie",
				"vn",
				additional ? kokoroURL : transformerURL,
			);
			const english = await synthesize(
				additional ? "vieneu-minh_quan_pro" : "Xenova/mms-tts-eng",
				"en",
				additional ? vieneuURL : transformerURL,
			);
			const models = additional
				? ([
						["kokoro-mai_linh", "vn", kokoroURL],
						["vieneu-minh_quan_pro", "vn", vieneuURL],
					] as const)
				: ([
						["vi_VN-25hours_single-low", "vn", piperURL],
						["vi_VN-vais1000-medium", "vn", piperURL],
						["vi_VN-vivos-x_low", "vn", piperURL],
						["en_US-amy-medium", "en", piperURL],
					] as const);
			let vieneuVietnamese: Float32Array | undefined;
			for (const [model, language, engine] of models) {
				// oxlint-disable-next-line no-await-in-loop -- Release one model before allocating the next.
				const audio = await synthesize(model, language, engine);
				if (additional && model.startsWith("vieneu")) vieneuVietnamese = audio;
			}

			const recognitions: [string, "vn" | "en", Float32Array][] = [
				["phowhisper-tiny", "vn", vietnamese],
				["whisper-tiny", "en", english],
			];
			if (vieneuVietnamese) recognitions.push(["phowhisper-tiny", "vn", vieneuVietnamese]);
			for (const [model, language, audio] of recognitions) {
				console.info("Checking local recognition:", model);
				// oxlint-disable-next-line no-await-in-loop
				const response = await infer(transformerURL, {
					type: "transcribe",
					model,
					language,
					audio,
				});
				if (!response.text?.trim()) throw new Error(`Empty local transcript: ${model}`);
				outputs.push({ model, text: response.text });
			}
			return outputs;
		},
		{
			transformerURL: `${appURL}/assets/${transformers}`,
			piperURL: `${appURL}/assets/${piper}`,
			kokoroURL: `${appURL}/assets/${kokoro}`,
			vieneuURL: `${appURL}/assets/${vieneu}`,
			additional: includeAdditional,
		},
	);
	for (const result of results) console.log(JSON.stringify(result));
	assert.equal(results.length, includeAdditional ? 7 : 8);
	console.log(
		includeAdditional
			? "Local browser inference passed for Kokoro (Diễm Trinh/Mai Linh), VieNeu (VN/EN) and speech-recognition round trips."
			: "Local browser inference passed for MMS (VN/EN), all 3 Vietnamese Piper voices, Amy, PhoWhisper Tiny and Whisper Tiny.",
	);
}
