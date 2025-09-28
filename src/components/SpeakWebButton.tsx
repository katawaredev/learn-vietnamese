import { type FC, useCallback } from "react";
import { SpeakBaseButton } from "./SpeakBaseButton";

// Interface for our mock HTMLAudioElement that wraps Web Speech API
interface MockAudioElement {
	_playbackRate: number;
	utterance: SpeechSynthesisUtterance | null;
	listeners: Map<string, EventListener>;
	currentTime: number;
	src: string;
	playbackRate: number;
	addEventListener(type: string, listener: EventListener): void;
	removeEventListener(type: string): void;
	dispatchEvent(type: string): boolean;
	play(): Promise<void>;
	pause(): void;
}

interface SpeakWebButtonProps {
	text: string;
	voice?: SpeechSynthesisVoice | null;
	size?: "small" | "medium" | "large";
}

export const SpeakWebButton: FC<SpeakWebButtonProps> = ({
	text,
	voice,
	size = "medium",
}) => {
	// Create a mock HTMLAudioElement that controls Web Speech API
	const getAudio = useCallback(async (): Promise<HTMLAudioElement> => {
		const trimmedText = text.trim();
		if (!trimmedText || !window.speechSynthesis) {
			throw new Error("Cannot create speech synthesis");
		}

		// Create a mock audio element that wraps SpeechSynthesis
		const mockAudio: MockAudioElement = {
			_playbackRate: 0.8,
			currentTime: 0,
			src: "",
			utterance: null,
			listeners: new Map<string, EventListener>(),

			get playbackRate() {
				return this._playbackRate;
			},

			set playbackRate(rate: number) {
				this._playbackRate = rate;
				if (this.utterance && window.speechSynthesis.speaking) {
					// Restart with new rate
					window.speechSynthesis.cancel();
					this.play?.();
				}
			},

			addEventListener(type: string, listener: EventListener) {
				this.listeners.set(type, listener);
			},

			removeEventListener(type: string) {
				this.listeners.delete(type);
			},

			dispatchEvent(type: string) {
				const listener = this.listeners.get(type);
				if (listener) {
					listener(new Event(type));
				}
				return true;
			},

			async play() {
				if (this.utterance) {
					// If we already have an utterance, just restart it
					window.speechSynthesis.cancel();
				}

				const utterance = new SpeechSynthesisUtterance(trimmedText);
				if (voice) {
					utterance.voice = voice;
				}
				utterance.lang = "vi-VN";
				utterance.rate = this._playbackRate;
				utterance.pitch = 1;

				utterance.onstart = () => this.dispatchEvent("play");
				utterance.onend = () => this.dispatchEvent("ended");
				utterance.onerror = (event) => {
					console.error("Speech synthesis error:", event.error);
					this.dispatchEvent("error");
				};

				this.utterance = utterance;
				window.speechSynthesis.speak(utterance);
			},

			pause() {
				if (window.speechSynthesis) {
					window.speechSynthesis.cancel();
				}
				this.utterance = null;
			},
		};

		return mockAudio as unknown as HTMLAudioElement;
	}, [text, voice]);

	const canPlay = useCallback(() => {
		return (
			!!text.trim() && typeof window !== "undefined" && !!window.speechSynthesis
		);
	}, [text]);

	return (
		<SpeakBaseButton
			key={text}
			size={size}
			getAudio={getAudio}
			canPlay={canPlay}
		/>
	);
};
