import { Select } from "~/components/Select";
import { useId, useSyncExternalStore } from "react";
import type { Language } from "./contracts";
import { useSpeech } from "./provider";
import {
	findLocalModel,
	localModels as availableLocalModels,
	type SpeechKind,
} from "./local/catalog";
import { getLocalStatuses, subscribeLocalStatuses, type LocalStatus } from "./local/client";
import { BROWSER_VOICE_PREFIX, selectionValue } from "./preferences";

const EMPTY_STATUSES: Readonly<Record<string, LocalStatus>> = {};
function LocalModelStatus({ kind, language }: { kind: SpeechKind; language: Language }) {
	const { localModels } = useSpeech();
	const statuses = useSyncExternalStore(
		subscribeLocalStatuses,
		getLocalStatuses,
		() => EMPTY_STATUSES,
	);
	const download = findLocalModel(kind, localModels[kind][language])?.downloadMB;
	const status = statuses[`${kind}:${language}`];
	return (
		<p role={status?.state === "error" ? "alert" : "status"} className="text-xs text-warm-cream/70">
			{status?.model !== localModels[kind][language] || status.state === "idle"
				? `${download ? `Local AI: about ${download} MB downloads` : "Local AI: downloads the selected model"} on first use; text and recordings stay on this device.`
				: status.state === "error"
					? status.error
					: status.state === "ready"
						? "Local model ready on this device."
						: status.state === "working"
							? "Running local model…"
							: status.file
								? `Downloading ${status.file}: ${Math.round(status.progress ?? 0)}%`
								: "Loading or running local model…"}
		</p>
	);
}

export function SpeechSettings({
	language,
	showHeading = true,
}: {
	language: Language;
	showHeading?: boolean;
}) {
	const id = useId();
	const { capabilities, preferences, localModels, voices, voiceIds, setSelection } = useSpeech();
	const label = language === "vn" ? "Vietnamese" : "English";
	const backendOptions = (kind: SpeechKind, server: boolean) => [
		...availableLocalModels(kind, language).map((model) => ({
			label: model.name,
			value: model.id,
		})),
		...(kind === "tts" && voices.some((voice) => voice.language === language)
			? voices
					.filter((voice) => voice.language === language)
					.map((voice) => ({ label: voice.name, value: `${BROWSER_VOICE_PREFIX}${voice.id}` }))
			: [{ label: "Browser speech", value: "browser" }]),
		...(server ? [{ label: "Server speech", value: "server" }] : []),
	];
	return (
		<div className="space-y-4">
			{showHeading && <h3 className="font-serif font-semibold text-gold">{label}</h3>}
			<label htmlFor={`${id}-playback`} className="block space-y-2 font-serif text-sm text-gold">
				<span>Speech synthesis model{language === "en" ? " (EN)" : ""}:</span>
				<Select
					id={`${id}-playback`}
					options={backendOptions("tts", capabilities.tts[language])}
					value={selectionValue(preferences, localModels, "tts", language, voiceIds[language])}
					onChange={(value) => setSelection("tts", language, value)}
					size="medium"
				/>
			</label>
			{preferences.tts[language] === "local" && <LocalModelStatus kind="tts" language={language} />}
			<label htmlFor={`${id}-recognition`} className="block space-y-2 font-serif text-sm text-gold">
				<span>Speech recognition model{language === "en" ? " (EN)" : ""}:</span>
				<Select
					id={`${id}-recognition`}
					options={backendOptions("stt", capabilities.stt)}
					value={selectionValue(preferences, localModels, "stt", language)}
					onChange={(value) => setSelection("stt", language, value)}
					size="medium"
				/>
			</label>
			{preferences.stt[language] === "local" && <LocalModelStatus kind="stt" language={language} />}
		</div>
	);
}
