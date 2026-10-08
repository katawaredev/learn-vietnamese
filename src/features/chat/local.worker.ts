import { MLCEngine } from "@mlc-ai/web-llm";
import { Schema } from "effect";
import { LocalChatRequest, type LocalChatEvent } from "./local-contracts";
import { conversationPrompt } from "./prompts";

let loadedModel: string | undefined;
let requestId = "";
const send = (event: LocalChatEvent) => self.postMessage(event);
const engine = new MLCEngine({
	initProgressCallback: (report) =>
		send({
			requestId,
			type: "status",
			state: "loading",
			message: `${Math.round(report.progress * 100)}% · ${report.text}`,
		}),
});

self.onmessage = (event: MessageEvent<unknown>) => {
	void (async () => {
		const { input, model, requestId: id } = Schema.decodeUnknownSync(LocalChatRequest)(event.data);
		requestId = id;
		if (loadedModel !== model) {
			await engine.reload(model);
			loadedModel = model;
		}
		send({ requestId, type: "status", state: "working", message: "Generating on this device…" });
		const thinking = input.mode === "practice" && (input.thinking ?? false);
		const stream = await engine.chat.completions.create({
			messages: [
				{ role: "system", content: conversationPrompt(input) },
				...input.messages.map(({ role, content }) => ({ role, content })),
			],
			stream: true,
			max_tokens: thinking ? 1024 : 512,
			temperature: input.mode === "translate" ? 0.3 : 0.7,
			extra_body: { enable_thinking: thinking },
		});
		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta.content;
			if (content) send({ requestId, type: "delta", content });
		}
		send({ requestId, type: "done" });
	})().catch((reason: unknown) =>
		send({
			requestId,
			type: "error",
			message:
				reason instanceof Error
					? reason.message.slice(0, 300)
					: "Local chat failed. Try a smaller model.",
		}),
	);
};
