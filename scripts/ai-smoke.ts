import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium, firefox, type Browser, type Page } from "playwright";
import { Schema } from "effect";
import { checkLocalVoiceAssets } from "./local-voice-assets.ts";
import { checkLocalSpeech } from "./local-speech-check.ts";

// Exercise the compiled server; a successful build cannot detect a recursive SSR bridge.
const root = fileURLToPath(new URL("../", import.meta.url));
const calls: string[] = [];
const chatModelsUsed: string[] = [];
let malformedAudio = false;
const ProviderChat = Schema.Struct({
	model: Schema.String,
	messages: Schema.Array(Schema.Struct({ content: Schema.String })),
});
function serverPort(server: Server) {
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("Missing test server address.");
	return address.port;
}
const wav = Buffer.alloc(44 + 24_000);
wav.write("RIFF");
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(24_000, 24);
wav.writeUInt32LE(48_000, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(24_000, 40);
for (let i = 0; i < 12_000; i++)
	wav.writeInt16LE(Math.round(Math.sin((i * 440 * 2 * Math.PI) / 24_000) * 2000), 44 + i * 2);

const service = createServer((request, response) => {
	void (async () => {
		const chunks: Uint8Array[] = [];
		for await (const chunk of request) {
			if (!Buffer.isBuffer(chunk)) throw new Error("Unexpected request data.");
			chunks.push(chunk);
		}
		const body = Buffer.concat(chunks).toString();
		calls.push(request.url ?? "");
		if (request.url === "/v1/audio/speech") {
			response.writeHead(200, { "Content-Type": "audio/wav" });
			response.end(malformedAudio ? "invalid audio" : wav);
			return;
		}
		if (request.url === "/v1/audio/transcriptions") {
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(JSON.stringify({ text: "Xin chào" }));
			return;
		}
		assert.equal(request.url, "/v1/chat/completions");
		const input = Schema.decodeUnknownSync(ProviderChat)(JSON.parse(body));
		chatModelsUsed.push(input.model);
		const slow = input.messages.at(-1)?.content.includes("slow");
		response.writeHead(200, { "Content-Type": "text/event-stream" });
		const emit = (content: string, finish_reason: string | null = null) =>
			response.write(
				`data: ${JSON.stringify({ id: "reply", object: "chat.completion.chunk", created: 1, model: "mock", choices: [{ index: 0, delta: { content }, finish_reason }] })}\n\n`,
			);
		emit("Xin ");
		const timer = setTimeout(
			() => {
				emit("chào!", "stop");
				response.end("data: [DONE]\n\n");
			},
			slow ? 10_000 : 100,
		);
		response.on("close", () => clearTimeout(timer));
	})().catch(() => {
		response.writeHead(500);
		response.end();
	});
});
await new Promise<void>((resolve) => service.listen(0, "127.0.0.1", resolve));
const serviceURL = `http://127.0.0.1:${serverPort(service)}/v1`;
const portReservation = createServer();
await new Promise<void>((resolve) => portReservation.listen(0, "127.0.0.1", resolve));
const port = serverPort(portReservation);
await new Promise<void>((resolve) => portReservation.close(() => resolve()));
const appURL = `http://127.0.0.1:${port}`;
const env: NodeJS.ProcessEnv = {
	...process.env,
	PORT: String(port),
	HOST: "127.0.0.1",
	NITRO_PORT: String(port),
	NITRO_HOST: "127.0.0.1",
};
delete env.NITRO_UNIX_SOCKET;
env.AI_CHAT_MODELS = "mock-two";
for (const kind of ["TTS_VN", "TTS_EN", "STT", "CHAT"]) {
	env[`AI_${kind}_BASE_URL`] = serviceURL;
	env[`AI_${kind}_MODEL`] = "mock";
	env[`AI_${kind}_VOICE`] = kind;
	env[`AI_${kind}_API_KEY`] = "";
}
const development = process.argv.includes("--dev");
const app = spawn(
	development ? "vp" : process.execPath,
	development ? ["dev", "--port", String(port), "--strictPort"] : [".output/server/index.mjs"],
	{
		cwd: root,
		env,
		// Vite+ launches a child CLI; terminate the whole owned server group on cleanup.
		detached: process.platform !== "win32",
		stdio: ["ignore", "pipe", "pipe"],
	},
);
let logs = "";
app.stdout.on("data", (value: Buffer) => {
	logs = (logs + value.toString()).slice(-12000);
});
app.stderr.on("data", (value: Buffer) => {
	logs = (logs + value.toString()).slice(-12000);
});
let browser: Browser | undefined;
let page: Page | undefined;

try {
	const deadline = Date.now() + (development ? 45_000 : 15_000);
	let capabilities: unknown;
	while (Date.now() < deadline) {
		if (app.exitCode !== null) throw new Error("The app server exited during startup.");
		try {
			// Startup retries are sequential and bounded, including stalled responses.
			// oxlint-disable-next-line no-await-in-loop
			const response = await fetch(`${appURL}/api/speech/capabilities`, {
				signal: AbortSignal.timeout(2000),
			});
			if (response.ok) {
				// oxlint-disable-next-line no-await-in-loop
				capabilities = await response.json();
				break;
			}
		} catch {
			/* Retry while the compiled server starts. */
		}
		// oxlint-disable-next-line no-await-in-loop
		await delay(100);
	}
	assert.deepEqual(capabilities, { tts: { vn: true, en: true }, stt: true, chat: true });
	browser = process.argv.includes("--firefox")
		? await firefox.launch({
				headless: true,
				firefoxUserPrefs: {
					"media.navigator.streams.fake": true,
					"media.navigator.permission.disabled": true,
				},
			})
		: await chromium.launch({
				headless: true,
				args: [
					"--use-fake-ui-for-media-stream",
					"--use-fake-device-for-media-stream",
					...(process.argv.includes("--local-chat-models")
						? ["--enable-unsafe-webgpu", "--use-angle=swiftshader"]
						: []),
				],
			});
	page = await browser.newPage({ viewport: { width: 1100, height: 850 }, locale: "vi-VN" });
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error" && /hydrat|uncaught/i.test(message.text()))
			errors.push(message.text().slice(0, 500));
	});
	await page.addInitScript(() => {
		Object.defineProperty(window.speechSynthesis, "getVoices", {
			value: () => [
				{ voiceURI: "test-vietnamese-native", name: "Vietnamese Nguyễn (Browser)", lang: "vi-VN" },
			],
		});
	});
	await page.goto(`${appURL}/chat`);
	await page.getByRole("button", { name: "Speech settings" }).click({ trial: true });
	await page.getByRole("textbox", { name: "Message" }).fill("Hello");
	await page.getByRole("button", { name: "Send message" }).click();
	await page.getByText("Xin chào!", { exact: true }).waitFor();
	await page.getByRole("button", { name: "Play audio" }).click();
	await page.getByRole("button", { name: "Stop audio" }).waitFor();
	await page.getByRole("button", { name: "Play audio" }).waitFor();
	assert(calls.includes("/v1/audio/speech"));
	malformedAudio = true;
	// A different lesson bypasses the successful response cached above.
	await page.goto(`${appURL}/numbers/counting`);
	await page.getByRole("button", { name: "Play audio", exact: true }).nth(12).click();
	await page
		.getByRole("alert")
		.getByText(/Could not decode/)
		.waitFor();
	malformedAudio = false;
	await page.getByRole("button", { name: "Play audio", exact: true }).nth(12).click();
	await page.getByRole("button", { name: "Stop audio", exact: true }).waitFor();
	await page.getByRole("button", { name: "Stop audio", exact: true }).waitFor({ state: "hidden" });
	assert.equal(await page.getByRole("alert").count(), 0);
	assert.deepEqual(errors, []);
	await page.goto(`${appURL}/chat`);
	await page.getByRole("textbox", { name: "Message" }).fill("Hello");
	await page.getByRole("button", { name: "Send message" }).click();
	await page.getByText("Xin chào!", { exact: true }).waitFor();
	await page.getByRole("button", { name: "Reset", exact: true }).click();
	await page.getByRole("textbox", { name: "Message" }).fill("slow response");
	await page.getByRole("button", { name: "Send message" }).click();
	await page.getByRole("button", { name: "Stop generation" }).click();
	assert(await page.getByRole("textbox", { name: "Message" }).isEnabled());
	await page.getByRole("button", { name: "Reset", exact: true }).click();
	await page.getByRole("button", { name: "Start recording" }).click();
	await page.getByRole("button", { name: "Stop recording" }).waitFor();
	// Give the real MediaRecorder a complete sample before stopping.
	await page.waitForTimeout(1200);
	await page.getByRole("button", { name: "Stop recording" }).click();
	await page.getByText("Xin chào!", { exact: true }).waitFor();
	assert(calls.includes("/v1/audio/transcriptions"));
	await page.getByRole("button", { name: "AI settings", exact: true }).click();
	await page.getByRole("dialog", { name: "AI Settings", exact: true }).waitFor();
	assert.equal(
		await page.getByRole("combobox").count(),
		3,
		"AI settings own English speech and conversation only.",
	);
	await page.getByRole("combobox").nth(2).click();
	await page.getByRole("option", { name: "mock-two (Server)", exact: true }).click();
	await page.getByRole("button", { name: "Close AI settings" }).click();
	assert.equal(
		await page.getByRole("article").count(),
		0,
		"Changing models clears the old conversation.",
	);
	await page.getByRole("textbox", { name: "Message" }).fill("Hello again");
	await page.getByRole("button", { name: "Send message" }).click();
	await page.getByText("Xin chào!", { exact: true }).waitFor();
	assert.equal(chatModelsUsed.at(-1), "mock-two");
	await page.getByRole("button", { name: "Speech settings" }).click();
	await page.getByRole("dialog", { name: "Speech settings" }).waitFor();
	assert.equal(await page.getByRole("combobox").count(), 2);
	assert.equal(page.workers().length, 0, "Native/server speech must not load model workers.");
	await page.getByRole("combobox").nth(0).click();
	await page.getByRole("option", { name: "Vietnamese Nguyễn (Browser)", exact: true }).click();
	assert.equal(
		await page.getByRole("combobox").count(),
		2,
		"Native voices must share the model selector.",
	);
	assert.equal(
		await page.evaluate(() => localStorage.getItem("speech-voice-vn")),
		"test-vietnamese-native",
	);
	assert.equal(page.workers().length, 0);
	await page.reload();
	// The dev module graph hydrates after the document load event.
	await page.getByRole("textbox", { name: "Message" }).fill("");
	await page.getByRole("button", { name: "Speech settings" }).click();
	assert.match(await page.getByRole("combobox").nth(0).innerText(), /Vietnamese Nguyễn/);
	assert.equal(page.workers().length, 0, "Native choice must persist without loading local AI.");
	const workerReady = page.waitForEvent("worker");
	await page.getByRole("combobox").nth(0).click();
	await page.getByRole("option", { name: "Vietnamese (MMS)", exact: true }).click();
	await workerReady;
	assert(page.workers().length > 0);
	await page.getByRole("combobox").nth(0).click();
	await page
		.getByRole("option", { name: "Vietnamese VAIS 1000 (Medium Quality)", exact: true })
		.click();
	await page.getByRole("combobox").nth(1).click();
	await page.getByRole("option", { name: "PhoWhisper Tiny", exact: true }).click();
	await page.getByRole("combobox").nth(1).click();
	await page.getByRole("option", { name: "Server speech", exact: true }).click();
	await page.getByRole("combobox").nth(0).click();
	await page.getByRole("option", { name: "Server speech", exact: true }).click();
	await page.getByRole("button", { name: "Close settings" }).click();
	await page.goto(`${appURL}/conversation`);
	await page.getByRole("button", { name: "AI settings", exact: true }).click();
	assert.match(await page.getByRole("combobox").nth(2).innerText(), /mock-two/);
	await page.screenshot({ path: "/tmp/learn-vietnamese-ai-settings.png" });
	await page.getByRole("button", { name: "Close AI settings" }).click();
	await page.getByRole("button", { name: "Speech settings" }).click();
	await page.screenshot({ path: "/tmp/learn-vietnamese-vietnamese-settings.png" });
	await page.getByRole("button", { name: "Reset speech settings" }).click();
	await page.getByRole("button", { name: "Close settings" }).click();
	await page.getByRole("button", { name: "AI settings", exact: true }).click();
	assert.match(
		await page.getByRole("combobox").nth(2).innerText(),
		/mock-two/,
		"Vietnamese reset preserves the conversation model.",
	);
	await page.getByRole("button", { name: "Close AI settings" }).click();
	for (const route of [
		"/numbers",
		"/numbers/counting",
		"/pronunciation",
		"/grammar",
		"/relations",
		"/conversation",
		"/numbers/practice",
		"/pronunciation/practice",
		"/relations/practice",
		"/grammar/practice",
	]) {
		// Navigation must finish before checking the next route.
		// oxlint-disable-next-line no-await-in-loop
		const response = await page.goto(`${appURL}${route}`);
		assert.equal(response?.status(), 200, route);
		// oxlint-disable-next-line no-await-in-loop
		await page.getByRole("button", { name: "Speech settings" }).click({ trial: true });
		if (development) {
			// The lazy Devtools stylesheet marks its imports ready; its live SSE stream never goes idle.
			// oxlint-disable-next-line no-await-in-loop
			await page.locator("#_goober").waitFor({ state: "attached" });
		}
		if (route === "/numbers")
			// Check the page after this navigation, before proceeding to the next route.
			// oxlint-disable-next-line no-await-in-loop
			assert.equal(await page.getByRole("button", { name: "AI settings", exact: true }).count(), 0);
	}
	assert.equal(
		await page.locator("body").getAttribute("translate"),
		"no",
		"Browser translation must preserve the bilingual learning content.",
	);
	assert.deepEqual(errors, []);
	if (process.argv.includes("--local-mms")) {
		console.log("Checking real MMS synthesis and playback…");
		await page.goto(`${appURL}/numbers/counting`);
		await page.evaluate(() => {
			const OriginalContext = window.AudioContext;
			window.AudioContext = class extends OriginalContext {
				createBufferSource() {
					const source = super.createBufferSource();
					const start = source.start.bind(source);
					source.start = (...args) => {
						if (this.state !== "running" || !source.buffer?.duration)
							throw new Error("Audio must be decoded and its context running before playback.");
						start(...args);
						document.documentElement.dataset.audioPlayed = "true";
					};
					return source;
				}
			};
		});
		for (const index of [5, 12, 12]) {
			// oxlint-disable-next-line no-await-in-loop
			await page.evaluate(() => delete document.documentElement.dataset.audioPlayed);
			// oxlint-disable-next-line no-await-in-loop
			await page.getByRole("button", { name: "Play audio", exact: true }).nth(index).click();
			// oxlint-disable-next-line no-await-in-loop
			await Promise.race([
				page.locator("html[data-audio-played=true]").waitFor({ timeout: 600_000 }),
				page
					.getByRole("alert")
					.first()
					.waitFor({ timeout: 600_000 })
					.then(async () => {
						throw new Error(await page!.getByRole("alert").first().innerText());
					}),
			]);
			// oxlint-disable-next-line no-await-in-loop
			await page
				.getByRole("button", { name: "Stop audio", exact: true })
				.waitFor({ state: "hidden", timeout: 30_000 });
			console.log(`MMS playback completed for card ${index}.`);
		}
		assert.equal(await page.getByRole("alert").count(), 0);
		assert.deepEqual(errors, []);
		if (development)
			assert(
				!logs.includes("optimized dependencies changed"),
				"First inference must not trigger a dependency-discovery reload.",
			);
		console.log(
			"Real Vietnamese MMS playback passed for năm and repeated mười hai, including local inference and Web Audio playback.",
		);
	}
	if (process.argv.includes("--local-chat-models")) {
		await page.goto(`${appURL}/chat`);
		await page.getByRole("textbox", { name: "Message" }).waitFor();
		await page.getByRole("button", { name: "AI settings", exact: true }).click();
		await page.getByRole("combobox").nth(2).click();
		await page.getByRole("option", { name: "Qwen 3.5 0.8B (Small download)", exact: true }).click();
		await page.getByRole("button", { name: "Close AI settings" }).click();
		const before = calls.filter((call) => call.includes("/chat/")).length;
		await page
			.getByRole("textbox", { name: "Message" })
			.fill("Hãy chào tôi bằng một câu tiếng Việt ngắn.");
		await page.getByRole("button", { name: "Send message" }).click();
		await page
			.getByRole("button", { name: "Stop generation" })
			.waitFor({ state: "hidden", timeout: 600_000 });
		assert.equal(await page.getByRole("alert").count(), 0);
		assert.match(await page.getByRole("article").last().innerText(), /[à-ỹ]/u);
		assert.equal(calls.filter((call) => call.includes("/chat/")).length, before);
		await page.getByRole("textbox", { name: "Message" }).fill("In English, translate xin chào.");
		await page.getByRole("button", { name: "Send message" }).click();
		await page
			.getByRole("button", { name: "Stop generation" })
			.waitFor({ state: "hidden", timeout: 120_000 });
		assert.match(await page.getByRole("article").last().innerText(), /hello|hi/i);
		assert.equal(await page.getByRole("alert").count(), 0);
		assert.deepEqual(errors, []);
		console.log(
			"Real Qwen 3.5 0.8B chat passed: Vietnamese reply, English translation and warm worker reuse with no server chat calls.",
		);
	}
	if (process.argv.includes("--local-models") || process.argv.includes("--additional-models")) {
		if (process.argv.includes("--additional-models")) await checkLocalVoiceAssets();
		await checkLocalSpeech(page, root, appURL, process.argv.includes("--additional-models"));
		const speechCalls = calls.filter((call) => call.includes("/audio/")).length;
		await page.goto(`${appURL}/chat`);
		await page.getByRole("button", { name: "Speech settings" }).click();
		await page.getByRole("combobox").nth(0).click();
		await page
			.getByRole("option", {
				name: process.argv.includes("--additional-models")
					? "Diễm Trinh (Kokoro)"
					: "Vietnamese (MMS)",
				exact: true,
			})
			.click();
		await page.getByRole("combobox").nth(1).click();
		await page.getByRole("option", { name: "PhoWhisper Tiny", exact: true }).click();
		await page.getByRole("button", { name: "Close settings" }).click();
		await page.getByRole("textbox", { name: "Message" }).fill("Hello");
		await page.getByRole("button", { name: "Send message" }).click();
		await page.getByText("Xin chào!", { exact: true }).waitFor();
		await page.getByRole("button", { name: "Play audio" }).click();
		await page.getByRole("button", { name: "Stop audio" }).waitFor();
		await page.getByRole("button", { name: "Play audio" }).waitFor({ timeout: 120_000 });
		if (process.argv.includes("--additional-models")) {
			await page.getByRole("button", { name: "Speech settings" }).click();
			await page.getByRole("combobox").nth(0).click();
			await page
				.getByRole("option", { name: "Minh Quân Pro (VieNeu v3 Turbo)", exact: true })
				.click();
			await page.getByRole("button", { name: "Close settings" }).click();
			await page.getByRole("button", { name: "Play audio" }).click();
			await page.getByRole("button", { name: "Stop audio" }).waitFor();
			await page.getByRole("button", { name: "Play audio" }).waitFor({ timeout: 120_000 });
		}
		await page.getByRole("button", { name: "Start recording" }).click();
		await page.getByRole("button", { name: "Stop recording" }).waitFor();
		await page.waitForTimeout(1200);
		await page.getByRole("button", { name: "Stop recording" }).click();
		await page.getByRole("button", { name: "Start recording" }).waitFor({ timeout: 120_000 });
		assert.equal(
			calls.filter((call) => call.includes("/audio/")).length,
			speechCalls,
			"Local speech controls must not call the server speech providers.",
		);
		assert.equal(await page.getByRole("alert").count(), 0);
		await page.getByRole("button", { name: "Speech settings" }).click();
		await page.getByRole("combobox").nth(0).click();
		await page.screenshot({
			path: process.argv.includes("--additional-models")
				? "/tmp/learn-vietnamese-additional-speech.png"
				: "/tmp/learn-vietnamese-local-speech.png",
		});
		console.log(
			"Local speech UI passed: selected model playback, microphone decode/resampling and PhoWhisper inference, with zero server speech calls.",
		);
	}
	console.log(
		`${development ? "Development" : "Production"} AI smoke test passed: chat stream/stop/reset, audio playback, microphone transcription, split settings, and lesson routes.`,
	);
} catch (error) {
	console.error(logs);
	if (page) console.error(await page.locator("body").innerText());
	throw error;
} finally {
	if (browser) await browser.close();
	if (process.platform !== "win32" && app.pid) {
		try {
			process.kill(-app.pid, "SIGTERM");
		} catch (error) {
			if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) {
				console.error("Could not stop the test server:", error);
				process.exitCode = 1;
			}
		}
	} else app.kill("SIGTERM");
	service.closeAllConnections();
	await new Promise<void>((resolve) => service.close(() => resolve()));
}
