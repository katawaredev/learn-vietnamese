import { createServerFn } from "@tanstack/react-start";
import adjectivesData from "~/data/grammar/adjectives.json";
import commandsData from "~/data/grammar/commands.json";
import comparativesData from "~/data/grammar/comparatives.json";
import conditionalsData from "~/data/grammar/conditionals.json";
import demonstrativesData from "~/data/grammar/demonstratives.json";
import exclamationsData from "~/data/grammar/exclamations.json";
import focusMarkersData from "~/data/grammar/focus-markers.json";
import modalVerbsData from "~/data/grammar/modal-verbs.json";
import negativesData from "~/data/grammar/negatives.json";
import passiveVoiceData from "~/data/grammar/passive-voice.json";
import practiceData from "~/data/grammar/practice.json";
import questionsData from "~/data/grammar/questions.json";
import sentenceStructureData from "~/data/grammar/sentence-structure.json";
import tensesData from "~/data/grammar/tenses.json";
import { getRandomElement } from "~/utils/random";

// --- Types ---

export type ExerciseType = "arrange" | "gap-fill-type" | "gap-fill-speak";

export interface Chunk {
	id: string;
	text: string;
	grammarType: string;
	meaning: string;
	isDistractor: boolean;
}

export interface ArrangeExercise {
	type: "arrange";
	english: string;
	chunks: Chunk[];
	correctOrder: string[];
	distractorIds: string[];
	hasDistractors: boolean;
}

export interface TextWord {
	text: string;
	grammarType: string;
	meaning: string;
}

export type Segment =
	| { kind: "text"; words: TextWord[] }
	| { kind: "gap"; gapIndex: number };

export interface Gap {
	index: number;
	expected: string;
	grammarType: string;
	meaning: string;
}

export interface GapFillExercise {
	type: "gap-fill-type" | "gap-fill-speak";
	english: string;
	segments: Segment[];
	gaps: Gap[];
}

export type Exercise = ArrangeExercise | GapFillExercise;

// --- Breakdown type (from grammar JSON) ---

interface BreakdownEntry {
	type: string;
	meaning: string;
}

interface GrammarExample {
	vietnamese: string;
	breakdown: Record<string, BreakdownEntry>;
	english: string;
	literalEnglish?: string;
	notes?: string;
}

interface TopicExamples {
	topic: string;
	topicId: string;
	examples: GrammarExample[];
	/** Grammar types that are "marker" types for this topic (used as gap-fill blanks) */
	markerTypes: string[];
}

// --- Marker types per topic ---
// These define which breakdown types are considered "grammar markers" for gap-fill exercises

const TOPIC_MARKER_TYPES: Record<string, string[]> = {
	"Sentence Structure": ["topic", "marker"],
	Tenses: ["tense-marker"],
	Questions: ["question", "particle", "rhetorical"],
	Negatives: ["negation"],
	Commands: ["particle", "modal"],
	Demonstratives: ["demonstrative"],
	Adjectives: ["adjective", "modifier", "intensifier"],
	Comparatives: ["comparative", "superlative", "intensifier"],
	Conditionals: ["conditional"],
	"Passive Voice": ["passive-positive", "passive-negative"],
	"Modal Verbs": ["modal"],
	"Focus Markers": ["marker", "particle"],
	Exclamations: ["particle", "intensifier"],
};

// --- Extract examples from each grammar JSON schema ---

function extractSectionsExamples(data: {
	sections: { examples: GrammarExample[] }[];
}): GrammarExample[] {
	return data.sections.flatMap((s) => s.examples);
}

function extractPatternsExamples(data: {
	patterns: { examples: GrammarExample[] }[];
}): GrammarExample[] {
	return data.patterns.flatMap((p) => p.examples);
}

function extractQuestionsExamples(
	data: typeof questionsData,
): GrammarExample[] {
	const examples: GrammarExample[] = [];
	for (const qt of data.questionTypes) {
		if ("patterns" in qt && qt.patterns) {
			for (const p of qt.patterns) {
				if ("examples" in p && p.examples) {
					examples.push(...(p.examples as unknown as GrammarExample[]));
				}
			}
		}
		if ("examples" in qt && qt.examples) {
			examples.push(...(qt.examples as unknown as GrammarExample[]));
		}
	}
	return examples;
}

// --- Build unified example pool ---

function buildTopicExamples(): TopicExamples[] {
	return [
		{
			topic: "Sentence Structure",
			topicId: "sentence-structure",
			examples: extractPatternsExamples(
				sentenceStructureData as unknown as {
					patterns: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES["Sentence Structure"],
		},
		{
			topic: "Tenses",
			topicId: "tenses",
			examples: extractSectionsExamples(
				tensesData as unknown as { sections: { examples: GrammarExample[] }[] },
			),
			markerTypes: TOPIC_MARKER_TYPES.Tenses,
		},
		{
			topic: "Questions",
			topicId: "questions",
			examples: extractQuestionsExamples(questionsData),
			markerTypes: TOPIC_MARKER_TYPES.Questions,
		},
		{
			topic: "Negatives",
			topicId: "negatives",
			examples: extractSectionsExamples(
				negativesData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Negatives,
		},
		{
			topic: "Commands",
			topicId: "commands",
			examples: extractSectionsExamples(
				commandsData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Commands,
		},
		{
			topic: "Demonstratives",
			topicId: "demonstratives",
			examples: extractSectionsExamples(
				demonstrativesData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Demonstratives,
		},
		{
			topic: "Adjectives",
			topicId: "adjectives",
			examples: extractSectionsExamples(
				adjectivesData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Adjectives,
		},
		{
			topic: "Comparatives",
			topicId: "comparatives",
			examples: extractSectionsExamples(
				comparativesData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Comparatives,
		},
		{
			topic: "Conditionals",
			topicId: "conditionals",
			examples: extractSectionsExamples(
				conditionalsData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Conditionals,
		},
		{
			topic: "Passive Voice",
			topicId: "passive-voice",
			examples: extractSectionsExamples(
				passiveVoiceData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES["Passive Voice"],
		},
		{
			topic: "Modal Verbs",
			topicId: "modal-verbs",
			examples: extractSectionsExamples(
				modalVerbsData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES["Modal Verbs"],
		},
		{
			topic: "Focus Markers",
			topicId: "focus-markers",
			examples: extractSectionsExamples(
				focusMarkersData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES["Focus Markers"],
		},
		{
			topic: "Exclamations",
			topicId: "exclamations",
			examples: extractSectionsExamples(
				exclamationsData as unknown as {
					sections: { examples: GrammarExample[] }[];
				},
			),
			markerTypes: TOPIC_MARKER_TYPES.Exclamations,
		},
	];
}

const PRACTICE_EXTRAS = practiceData as unknown as Record<
	string,
	GrammarExample[]
>;

const ALL_TOPICS = buildTopicExamples().map((t) => ({
	...t,
	examples: [...t.examples, ...(PRACTICE_EXTRAS[t.topicId] ?? [])],
}));

// --- Exercise type weighting ---

type WeightTuple = [arrange: number, gapFillType: number, gapFillSpeak: number];

const TOPIC_WEIGHTS: Record<string, WeightTuple> = {
	"sentence-structure": [5, 1, 1],
	tenses: [2, 5, 2],
	questions: [5, 2, 2],
	negatives: [2, 5, 2],
	commands: [2, 2, 5],
	demonstratives: [2, 5, 2],
	adjectives: [5, 2, 2],
	comparatives: [5, 2, 2],
	conditionals: [5, 2, 2],
	"passive-voice": [5, 2, 2],
	"modal-verbs": [2, 5, 2],
	"focus-markers": [2, 5, 2],
	exclamations: [2, 2, 5],
};

function pickExerciseType(topicId: string): ExerciseType {
	const weights = TOPIC_WEIGHTS[topicId] ?? [3, 3, 3];
	const total = weights[0] + weights[1] + weights[2];
	const r = Math.random() * total;
	if (r < weights[0]) return "arrange";
	if (r < weights[0] + weights[1]) return "gap-fill-type";
	return "gap-fill-speak";
}

// --- Arrange exercise generator ---

let chunkIdCounter = 0;
function nextChunkId(): string {
	return `chunk-${++chunkIdCounter}`;
}

function generateArrangeExercise(
	topicExamples: TopicExamples,
	example: GrammarExample,
): ArrangeExercise {
	const breakdownKeys = Object.keys(example.breakdown);
	const chunks: Chunk[] = breakdownKeys.map((key) => ({
		id: nextChunkId(),
		text: key,
		grammarType: example.breakdown[key].type,
		meaning: example.breakdown[key].meaning,
		isDistractor: false,
	}));

	// Maybe add distractors (~50% chance)
	const distractorChunks: Chunk[] = [];
	if (Math.random() < 0.5) {
		const distractors = findDistractors(topicExamples, example);
		for (const d of distractors.slice(0, 2)) {
			const chunk: Chunk = {
				id: nextChunkId(),
				text: d.text,
				grammarType: d.grammarType,
				meaning: d.meaning,
				isDistractor: true,
			};
			distractorChunks.push(chunk);
		}
	}

	const allChunks = [...chunks, ...distractorChunks];
	// Shuffle
	for (let i = allChunks.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[allChunks[i], allChunks[j]] = [allChunks[j], allChunks[i]];
	}

	return {
		type: "arrange",
		english: example.english,
		chunks: allChunks,
		correctOrder: breakdownKeys,
		distractorIds: distractorChunks.map((c) => c.id),
		hasDistractors: distractorChunks.length > 0,
	};
}

function findDistractors(
	topicExamples: TopicExamples,
	currentExample: GrammarExample,
): { text: string; grammarType: string; meaning: string }[] {
	const usedTexts = new Set(Object.keys(currentExample.breakdown));
	const candidates: { text: string; grammarType: string; meaning: string }[] =
		[];

	// Look through all examples in same topic for markers not in current sentence
	for (const ex of topicExamples.examples) {
		for (const [text, entry] of Object.entries(ex.breakdown)) {
			if (
				!usedTexts.has(text) &&
				topicExamples.markerTypes.includes(entry.type) &&
				!candidates.some((c) => c.text === text)
			) {
				candidates.push({
					text,
					grammarType: entry.type,
					meaning: entry.meaning,
				});
			}
		}
	}

	// Shuffle candidates
	for (let i = candidates.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[candidates[i], candidates[j]] = [candidates[j], candidates[i]];
	}

	return candidates;
}

// --- Gap-fill exercise generator ---

function generateGapFillExercise(
	topicExamples: TopicExamples,
	example: GrammarExample,
	exerciseType: "gap-fill-type" | "gap-fill-speak",
): GapFillExercise {
	const breakdownKeys = Object.keys(example.breakdown);
	const segments: Segment[] = [];
	const gaps: Gap[] = [];

	let gapIndex = 0;
	let textBuffer: TextWord[] = [];

	for (const key of breakdownKeys) {
		const entry = example.breakdown[key];
		const isMarker = topicExamples.markerTypes.includes(entry.type);

		if (isMarker) {
			if (textBuffer.length > 0) {
				segments.push({ kind: "text", words: textBuffer });
				textBuffer = [];
			}
			gaps.push({
				index: gapIndex,
				expected: key,
				grammarType: entry.type,
				meaning: entry.meaning,
			});
			segments.push({ kind: "gap", gapIndex });
			gapIndex++;
		} else {
			textBuffer.push({
				text: key,
				grammarType: entry.type,
				meaning: entry.meaning,
			});
		}
	}

	if (textBuffer.length > 0) {
		segments.push({ kind: "text", words: textBuffer });
	}

	// If no gaps were created (no markers found), fall back to arrange
	// This shouldn't happen with proper markerTypes config, but handle gracefully
	if (gaps.length === 0) {
		// Make the first non-subject word a gap
		const firstNonSubject = breakdownKeys.find(
			(k) => example.breakdown[k].type !== "subject",
		);
		if (firstNonSubject) {
			const entry = example.breakdown[firstNonSubject];
			return generateGapFillFromSpecificWords(
				example,
				[{ key: firstNonSubject, entry }],
				exerciseType,
			);
		}
	}

	return {
		type: exerciseType,
		english: example.english,
		segments,
		gaps,
	};
}

function generateGapFillFromSpecificWords(
	example: GrammarExample,
	gapWords: { key: string; entry: BreakdownEntry }[],
	exerciseType: "gap-fill-type" | "gap-fill-speak",
): GapFillExercise {
	const breakdownKeys = Object.keys(example.breakdown);
	const gapKeys = new Set(gapWords.map((w) => w.key));
	const segments: Segment[] = [];
	const gaps: Gap[] = [];

	let gapIndex = 0;
	let textBuffer: TextWord[] = [];

	for (const key of breakdownKeys) {
		if (gapKeys.has(key)) {
			if (textBuffer.length > 0) {
				segments.push({ kind: "text", words: textBuffer });
				textBuffer = [];
			}
			const entry = example.breakdown[key];
			gaps.push({
				index: gapIndex,
				expected: key,
				grammarType: entry.type,
				meaning: entry.meaning,
			});
			segments.push({ kind: "gap", gapIndex });
			gapIndex++;
		} else {
			const entry = example.breakdown[key];
			textBuffer.push({
				text: key,
				grammarType: entry.type,
				meaning: entry.meaning,
			});
		}
	}

	if (textBuffer.length > 0) {
		segments.push({ kind: "text", words: textBuffer });
	}

	return {
		type: exerciseType,
		english: example.english,
		segments,
		gaps,
	};
}

// --- Main server function ---

interface GenerateExerciseParams {
	mode?: string; // "random" | "arrange" | "speak" | "type"
}

export const getRandomGrammarExercise = createServerFn({ method: "GET" })
	.inputValidator((input: GenerateExerciseParams) => input)
	.handler(async ({ data }): Promise<Exercise> => {
		const { mode = "random" } = data;

		const topicExamples = getRandomElement(ALL_TOPICS);

		if (topicExamples.examples.length === 0) {
			throw new Error(`No examples found for topic: ${topicExamples.topic}`);
		}

		const example = getRandomElement(topicExamples.examples);

		// Pick exercise type
		let exerciseType: ExerciseType;
		if (mode === "arrange") {
			exerciseType = "arrange";
		} else if (mode === "speak") {
			exerciseType = "gap-fill-speak";
		} else if (mode === "type") {
			exerciseType = "gap-fill-type";
		} else {
			exerciseType = pickExerciseType(topicExamples.topicId);
		}

		// Generate the exercise
		if (exerciseType === "arrange") {
			return generateArrangeExercise(topicExamples, example);
		}
		return generateGapFillExercise(topicExamples, example, exerciseType);
	});
