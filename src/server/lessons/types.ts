// src/server/lessons/types.ts
import type { ReactNode } from "react";

export interface BreakdownEntry {
	type: string;
	meaning: string;
}

export interface GrammarExample {
	vietnamese: string;
	breakdown: Record<string, BreakdownEntry>;
	english: string;
	literalEnglish?: string;
	notes?: string;
	comparison?: string;
	particleUsed?: string;
}

export interface WordDataEntry {
	meaning: string;
	pronunciation?: string;
	notes?: string;
}

export interface GrammarSection {
	id: string;
	title: string;
	description: string;
	markers?: Record<string, WordDataEntry>;
	words?: Record<string, WordDataEntry>;
	colorKey?: string;
	examples: GrammarExample[];
}

export interface GrammarModuleData {
	introduction: {
		title: string;
		content: string[];
	};
	sections: GrammarSection[];
}

export interface ExampleFooterSlotArgs {
	key: string;
	vietnamese: string;
	english: string;
	breakdown: Record<string, BreakdownEntry>;
	literalEnglish?: string;
	notes?: string;
	comparison?: string;
	particleUsed?: string;
}

export interface WordAudioSlotArgs {
	word: string;
}

export interface GrammarSlotProps {
	renderExampleFooter?: (args: ExampleFooterSlotArgs) => ReactNode;
	renderWordAudio?: (args: WordAudioSlotArgs) => ReactNode;
}
