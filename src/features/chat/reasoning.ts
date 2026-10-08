export interface ChatDelta {
	type: "text" | "thinking";
	content: string;
}

// Qwen emits think tags in content; hold partial tags across token boundaries.
export class ReasoningParser {
	private pending = "";
	private state: "start" | "thinking" | "text" = "start";
	private thinkingStarted = false;
	private textStarted = false;
	push(content: string): ChatDelta[] {
		this.pending += content;
		if (this.state === "start") {
			this.pending = this.pending.trimStart();
			if ("<think>".startsWith(this.pending)) return [];
			if (this.pending.startsWith("<think>")) {
				this.pending = this.pending.slice(7);
				this.state = "thinking";
			} else this.state = "text";
		}
		if (this.state === "text") return this.flush();
		// Non-thinking Qwen replies begin with an empty think block.
		if (!this.thinkingStarted) this.pending = this.pending.trimStart();
		const end = this.pending.indexOf("</think>");
		if (end >= 0) {
			const thinking = this.pending.slice(0, end);
			this.pending = this.pending.slice(end + 8).trimStart();
			this.state = "text";
			return [
				...(thinking ? [{ type: "thinking" as const, content: thinking }] : []),
				...this.flush(),
			];
		}
		let held = 0;
		for (let length = 1; length < 8; length++)
			if (this.pending.endsWith("</think>".slice(0, length))) held = length;
		const thinking = this.pending.slice(0, this.pending.length - held);
		this.pending = this.pending.slice(this.pending.length - held);
		if (thinking) this.thinkingStarted = true;
		return thinking ? [{ type: "thinking", content: thinking }] : [];
	}
	flush(): ChatDelta[] {
		const content =
			this.state === "text" && !this.textStarted ? this.pending.trimStart() : this.pending;
		this.pending = "";
		if (this.state === "text" && content) this.textStarted = true;
		return content ? [{ type: this.state === "thinking" ? "thinking" : "text", content }] : [];
	}
}
