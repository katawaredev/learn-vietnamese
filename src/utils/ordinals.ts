/**
 * Vietnamese ordinal number utilities.
 *
 * Vietnamese ordinals use "thứ" prefix:
 * - First: thứ nhất (or đầu tiên)
 * - Second: thứ hai
 * - Third: thứ ba
 * - etc.
 *
 * Special cases:
 * - "thứ nhất" is the formal first, but "đầu tiên" is also common
 * - Days of week use ordinals (thứ hai = Monday, literally "second day")
 * - Sunday is "Chủ nhật" (special case, not ordinal)
 */

import { numberToText } from "./numeric";

/**
 * Converts a number to its ordinal form in Vietnamese.
 * @param num - Cardinal number (1, 2, 3, ...)
 * @returns Ordinal text (thứ nhất, thứ hai, thứ ba, ...)
 */
export function numberToOrdinal(num: number): string {
	if (!Number.isInteger(num) || num < 1) {
		throw new RangeError("Ordinal numbers must be positive integers");
	}

	// Special case for first
	if (num === 1) {
		return "thứ nhất";
	}

	// All other ordinals: thứ + cardinal number
	return `thứ ${numberToText(num)}`;
}

/**
 * Alternative form for "first" using "đầu tiên".
 * This is more colloquial and commonly used.
 * @returns "đầu tiên"
 */
export function first(): string {
	return "đầu tiên";
}

/**
 * Alternative form for "last" using "cuối cùng".
 * @returns "cuối cùng"
 */
export function last(): string {
	return "cuối cùng";
}

/**
 * Parses Vietnamese ordinal text back to number.
 * @param text - Vietnamese ordinal (e.g., "thứ hai")
 * @returns Cardinal number
 */
export function ordinalToNumber(text: string): number {
	const normalized = text.toLowerCase().trim();

	// Special cases
	if (normalized === "thứ nhất" || normalized === "đầu tiên") {
		return 1;
	}

	// Extract number part after "thứ"
	if (!normalized.startsWith("thứ ")) {
		throw new Error(`Invalid ordinal format: ${text}`);
	}

	const numberPart = normalized.substring(4); // Remove "thứ "

	// Map basic numbers for quick parsing
	const basicOrdinals: Record<string, number> = {
		hai: 2,
		ba: 3,
		tư: 4,
		bốn: 4,
		năm: 5,
		sáu: 6,
		bảy: 7,
		tám: 8,
		chín: 9,
		mười: 10,
	};

	if (basicOrdinals[numberPart]) {
		return basicOrdinals[numberPart];
	}

	// For complex ordinals, would need full text-to-number parsing
	// This is a simplified version
	throw new Error(`Complex ordinal parsing not yet implemented: ${text}`);
}

/**
 * Common ordinal expressions for reference.
 */
export const COMMON_ORDINALS = {
	first: "thứ nhất",
	firstAlt: "đầu tiên",
	second: "thứ hai",
	third: "thứ ba",
	fourth: "thứ tư",
	fifth: "thứ năm",
	sixth: "thứ sáu",
	seventh: "thứ bảy",
	eighth: "thứ tám",
	ninth: "thứ chín",
	tenth: "thứ mười",
	last: "cuối cùng",
} as const;
