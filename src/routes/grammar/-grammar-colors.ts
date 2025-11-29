/**
 * Color mappings for Vietnamese grammar type annotations
 * Used across grammar pages to provide consistent color-coding for word types
 */
export const GRAMMAR_TYPE_COLORS: Record<string, string> = {
	// Core sentence components
	subject: "text-blue-400",
	verb: "text-green-400",
	verb1: "text-green-400",
	verb2: "text-green-500",
	object: "text-yellow-400",

	// Topic-comment structure
	topic: "text-purple-400",
	marker: "text-pink-400",

	// Noun phrase components
	classifier: "text-cyan-400",
	noun: "text-amber-400",
	adjective: "text-lime-400",
	modifier: "text-teal-400",
	demonstrative: "text-fuchsia-400",
	article: "text-emerald-400",
	totality: "text-violet-400",
	quantifier: "text-sky-400",
	possessive: "text-rose-400",

	// Questions
	question: "text-pink-500",

	// Location and direction
	location: "text-indigo-400",
	direction: "text-purple-500",
	preposition: "text-slate-400",

	// Particles and modifiers
	particle: "text-orange-400",
	negation: "text-red-400",
	modal: "text-purple-400",
	"tense-marker": "text-orange-500",

	// Passive voice markers
	"passive-positive": "text-emerald-500",
	"passive-negative": "text-red-500",

	// Rhetorical questions
	rhetorical: "text-rose-500",

	// Comparatives and superlatives
	comparative: "text-cyan-500",
	superlative: "text-blue-500",
	intensifier: "text-amber-500",

	// Conditionals
	conditional: "text-purple-500",

	// Other
	adverb: "text-pink-400",
};
