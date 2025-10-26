/**
 * Relationship types for conversation translation with cultural context
 */
export type PersonType =
	| "child"
	| "teenager"
	| "friend"
	| "spouse"
	| "mother-in-law"
	| "father-in-law"
	| "shopkeeper"
	| "colleague"
	| "elder"
	| "younger";

/**
 * Translation direction for prompt generation
 */
export type TranslationDirection = "en-to-vi" | "vi-to-en";

/**
 * Metadata for each person type with Vietnamese pronouns and formality
 */
interface PersonTypeConfig {
	label: string;
	pronounYou: string; // Vietnamese pronoun for "you" when addressing them
	pronounI: string; // Vietnamese pronoun for "I" when speaking to them
	formality: "casual" | "respectful" | "very-formal";
}

const PERSON_CONFIGS: Record<PersonType, PersonTypeConfig> = {
	child: {
		label: "Child (5-10 years old)",
		pronounYou: "con",
		pronounI: "bác/chú/cô",
		formality: "casual",
	},
	teenager: {
		label: "Teenager",
		pronounYou: "em",
		pronounI: "anh/chị",
		formality: "casual",
	},
	friend: {
		label: "Friend (casual)",
		pronounYou: "bạn/cậu",
		pronounI: "tớ/mình",
		formality: "casual",
	},
	spouse: {
		label: "Spouse/Partner",
		pronounYou: "em/anh",
		pronounI: "anh/em",
		formality: "casual",
	},
	"mother-in-law": {
		label: "Mother-in-law",
		pronounYou: "mẹ",
		pronounI: "con",
		formality: "very-formal",
	},
	"father-in-law": {
		label: "Father-in-law",
		pronounYou: "bố",
		pronounI: "con",
		formality: "very-formal",
	},
	shopkeeper: {
		label: "Shopkeeper/Vendor",
		pronounYou: "chú/cô",
		pronounI: "cháu/em",
		formality: "respectful",
	},
	colleague: {
		label: "Colleague (formal)",
		pronounYou: "anh/chị",
		pronounI: "tôi",
		formality: "respectful",
	},
	elder: {
		label: "Elder (respectful)",
		pronounYou: "bác/cô/chú",
		pronounI: "cháu",
		formality: "very-formal",
	},
	younger: {
		label: "Younger person",
		pronounYou: "em",
		pronounI: "anh/chị",
		formality: "casual",
	},
};

/**
 * Generate system prompt for translation based on person type and direction
 */
export function generateTranslationPrompt(
	personType: PersonType,
	direction: TranslationDirection,
): string {
	const config = PERSON_CONFIGS[personType];

	if (direction === "en-to-vi") {
		return `You are a professional English-to-Vietnamese translator for real-time conversations.

Context: The user is speaking to their ${config.label.toLowerCase()}.

Instructions:
- Translate the user's English to natural, culturally appropriate Vietnamese
- Use ${config.formality === "very-formal" ? "highly formal and respectful" : config.formality === "respectful" ? "polite and respectful" : "casual and friendly"} language
- Use appropriate pronouns: "${config.pronounI}" for "I/me" and "${config.pronounYou}" for "you"
- Include cultural politeness markers appropriate for this relationship
- Output ONLY the Vietnamese translation, no explanations or additional text
- Use plain text only - no emojis, symbols, markdown formatting, or special characters
- Keep the tone and intent of the original message

Translate naturally as if you are the user speaking to this person.`;
	} else {
		return `You are a professional Vietnamese-to-English translator for real-time conversations.

Context: A ${config.label.toLowerCase()} is speaking to the user.

Instructions:
- Translate the Vietnamese text to natural English
- Preserve the tone, formality, and cultural context of the original
- The speaker is using ${config.formality === "very-formal" ? "very formal and respectful" : config.formality === "respectful" ? "polite" : "casual"} language
- Output ONLY the English translation, no explanations or additional text
- Use plain text only - no emojis, symbols, markdown formatting, or special characters
- Maintain the emotional tone and intent of the speaker

Translate naturally to convey what this person is saying.`;
	}
}

/**
 * Get display label for person type selector
 */
export function getPersonTypeLabel(personType: PersonType): string {
	return PERSON_CONFIGS[personType].label;
}

/**
 * Get all person types for dropdown
 */
export function getAllPersonTypes(): PersonType[] {
	return Object.keys(PERSON_CONFIGS) as PersonType[];
}
