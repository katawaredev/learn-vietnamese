import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/debug/speech-recognition-crash")({
	component: SpeechRecognitionCrashPage,
});

/**
 * Minimal reproduction page for the Safari iOS SpeechRecognition crash.
 *
 * The BROKEN button reuses the same SpeechRecognition instance — crashes on
 * Safari iOS on the second press.
 *
 * The FIXED button creates a new instance every time — works reliably.
 *
 * See: https://bugs.webkit.org/show_bug.cgi?id=225298
 * Test with: https://ui79.com/speech-recognition
 */
function SpeechRecognitionCrashPage() {
	const [brokenLog, setBrokenLog] = useState<string[]>([]);
	const [fixedLog, setFixedLog] = useState<string[]>([]);

	// BROKEN: single instance stored in a ref, reused across presses
	const brokenRecognition = useRef<SpeechRecognition | null>(null);
	if (brokenRecognition.current === null && typeof window !== "undefined") {
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SR) {
			const r = new SR();
			r.lang = "vi-VN";
			r.continuous = false;
			r.interimResults = false;
			brokenRecognition.current = r;
		}
	}

	function startBroken() {
		if (!brokenRecognition.current) {
			setBrokenLog((l) => [...l, "SpeechRecognition not available"]);
			return;
		}
		brokenRecognition.current.onstart = () =>
			setBrokenLog((l) => [...l, "started"]);
		brokenRecognition.current.onresult = (e: SpeechRecognitionEvent) =>
			setBrokenLog((l) => [...l, `result: ${e.results[0][0].transcript}`]);
		brokenRecognition.current.onerror = (e: SpeechRecognitionErrorEvent) =>
			setBrokenLog((l) => [...l, `error: ${e.error}`]);
		brokenRecognition.current.onend = () =>
			setBrokenLog((l) => [...l, "ended"]);
		try {
			brokenRecognition.current.start(); // 💥 throws InvalidStateError on Safari on 2nd press
		} catch (e) {
			setBrokenLog((l) => [...l, `CRASH: ${e}`]);
		}
	}

	// FIXED: fresh instance every time
	function startFixed() {
		const SR =
			typeof window !== "undefined" &&
			(window.SpeechRecognition || window.webkitSpeechRecognition);
		if (!SR) {
			setFixedLog((l) => [...l, "SpeechRecognition not available"]);
			return;
		}
		const r = new SR();
		r.lang = "vi-VN";
		r.continuous = false;
		r.interimResults = false;
		r.onstart = () => setFixedLog((l) => [...l, "started"]);
		r.onresult = (e: SpeechRecognitionEvent) =>
			setFixedLog((l) => [...l, `result: ${e.results[0][0].transcript}`]);
		r.onerror = (e: SpeechRecognitionErrorEvent) =>
			setFixedLog((l) => [...l, `error: ${e.error}`]);
		r.onend = () => setFixedLog((l) => [...l, "ended"]);
		r.start();
	}

	return (
		<div className="mx-auto max-w-xl space-y-10 p-8 font-mono text-sm">
			<h1 className="font-bold text-xl">
				Safari SpeechRecognition Crash Repro
			</h1>
			<p className="text-white/60">
				Press each button twice. On Safari iOS, BROKEN crashes on the second
				press. FIXED works every time.
				<br />
				<a
					href="https://ui79.com/speech-recognition"
					target="_blank"
					rel="noreferrer"
					className="text-sky-400 underline"
				>
					Also test at ui79.com/speech-recognition
				</a>
			</p>

			<div className="space-y-3">
				<button
					type="button"
					onClick={startBroken}
					className="rounded bg-red-800 px-4 py-2 text-white hover:bg-red-700"
				>
					BROKEN — reused instance
				</button>
				<div className="min-h-16 rounded border border-red-800/40 bg-red-950/20 p-3 text-red-300">
					{brokenLog.length === 0 ? (
						<span className="text-white/30">log empty</span>
					) : (
						// biome-ignore lint/suspicious/noArrayIndexKey: test
						brokenLog.map((entry, i) => <div key={i}>{entry}</div>)
					)}
				</div>
			</div>

			<div className="space-y-3">
				<button
					type="button"
					onClick={startFixed}
					className="rounded bg-green-800 px-4 py-2 text-white hover:bg-green-700"
				>
					FIXED — new instance each time
				</button>
				<div className="min-h-16 rounded border border-green-800/40 bg-green-950/20 p-3 text-green-300">
					{fixedLog.length === 0 ? (
						<span className="text-white/30">log empty</span>
					) : (
						// biome-ignore lint/suspicious/noArrayIndexKey: test
						fixedLog.map((entry, i) => <div key={i}>{entry}</div>)
					)}
				</div>
			</div>
		</div>
	);
}
