/**
 * Converts a number to Vietnamese text following standard pronunciation rules.
 *
 * Vietnamese number system groups digits by thousands (nghìn), millions (triệu), billions (tỷ).
 * Within each 3-digit group, the structure is: [hundreds trăm] [tens mươi/mười] [units]
 *
 * Key pronunciation rules:
 * - "lẻ" appears after trăm when tens=0 but units>0 (e.g., 105 = "một trăm lẻ năm")
 * - "mười" is used for exactly 10, "mươi" for other tens (20, 30, etc.)
 * - "mốt" replaces "một" for 1 in units position after mươi (e.g., 21 = "hai mươi mốt")
 * - "lăm" replaces "năm" for 5 in units position after mươi (e.g., 25 = "hai mươi lăm")
 *
 * @param num - Integer from 0 to 999,999,999,999
 * @returns Vietnamese text representation
 */
export function numberToText(num: number): string {
	if (!Number.isInteger(num) || num < 0 || num > 999_999_999_999)
		throw new RangeError("Only integers from 0 to 999,999,999,999 supported");

	// Base digits 0-9
	const digits = [
		"không",
		"một",
		"hai",
		"ba",
		"bốn",
		"năm",
		"sáu",
		"bảy",
		"tám",
		"chín",
	];
	// Scale words for thousand/million/billion groups
	const units = ["", "nghìn", "triệu", "tỷ"];

	if (num === 0) return "không";

	// Split number into groups of 3 digits (e.g., 1234567 → [567, 234, 1])
	const groups: number[] = [];
	while (num > 0) {
		groups.push(num % 1000);
		num = Math.floor(num / 1000);
	}

	/**
	 * Reads a single 3-digit group following Vietnamese pronunciation rules.
	 * @param n - Number from 0-999
	 * @param full - Whether this is a non-leading group (affects zero handling)
	 */
	const readGroup = (n: number, full: boolean): string => {
		const tr = Math.floor(n / 100); // trăm (hundreds)
		const ch = Math.floor((n % 100) / 10); // chục (tens)
		const dv = n % 10; // đơn vị (units)
		const parts: string[] = [];

		// Hundreds place
		if (full || tr > 0) {
			parts.push(digits[tr], "trăm");
			// "lẻ" bridges hundreds and units when tens=0 (e.g., 105 → "một trăm lẻ năm")
			if (ch === 0 && dv > 0) parts.push("lẻ");
		}

		// Tens place: "mươi" for 20-90, "mười" for exactly 10
		if (ch > 1) {
			parts.push(digits[ch], "mươi");
			if (dv === 1)
				parts.push("mốt"); // Special: 21 → "hai mươi mốt" (not "một")
			else if (dv === 5)
				parts.push("lăm"); // Special: 25 → "hai mươi lăm" (not "năm")
			else if (dv > 0) parts.push(digits[dv]);
		} else if (ch === 1) {
			parts.push("mười"); // 10-19 use "mười" (not "một mươi")
			if (dv === 5)
				parts.push("lăm"); // 15 → "mười lăm"
			else if (dv > 0) parts.push(digits[dv]);
		} else if (ch === 0 && dv > 0 && (!full || tr > 0)) {
			// Units only (when no tens and either has hundreds or is the last group)
			parts.push(digits[dv]);
		}

		return parts.join(" ").trim();
	};

	// Build result from highest group (tỷ) to lowest (units)
	const result: string[] = [];
	for (let i = groups.length - 1; i >= 0; i--) {
		const group = groups[i];
		if (group > 0) {
			const full = i < groups.length - 1; // Non-leading groups need explicit zeros
			result.push(readGroup(group, full), units[i]);
		} else if (i === 0 && result.length === 0) {
			// Edge case: if we've processed everything and have nothing, it's zero
			result.push("không");
		}
	}

	return result.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Parses Vietnamese number text back to numeric value.
 *
 * REQUIRES properly accented Vietnamese input. Users must type numbers correctly with diacritics.
 *
 * Parser logic:
 * - Accumulates digits into `group` (current 3-digit cluster)
 * - "trăm" multiplies current group by 100
 * - "mười" = exactly 10, "mươi" = tens multiplier (20, 30, etc.)
 * - Scale words (nghìn, triệu, tỷ) apply the multiplier and reset accumulator
 * - Special pronunciations: "mốt" (1 in units after mươi), "lăm" (5 in units after mươi)
 *
 * @param input - Vietnamese number text with proper diacritics (e.g., "hai mươi lăm")
 * @returns Numeric value
 */
export function textToNumber(input: string): number {
	if (typeof input !== "string" || !input.trim()) {
		throw new Error("Invalid input");
	}

	// Only normalize to lowercase, preserve diacritics for semantic meaning
	const text = input.toLowerCase().trim();

	// Map base digits and special pronunciations to numeric values (with proper diacritics)
	const digitMap: Record<string, number> = {
		không: 0,
		một: 1,
		mốt: 1, // Special: 1 in units position after mươi (21, 31, etc.)
		hai: 2,
		ba: 3,
		bốn: 4,
		tư: 4, // Regional variant for 4
		năm: 5,
		lăm: 5, // Special: 5 in units position after mươi (15, 25, etc.)
		sáu: 6,
		bảy: 7,
		tám: 8,
		chín: 9,
	};

	const words = text.split(/\s+/);
	let total = 0; // Final accumulated value across all scale groups
	let current = 0; // Current scale group's accumulated value (e.g., within current "nghìn" group)
	let group = 0; // Current sub-group being built (0-999)

	/**
	 * Applies a scale multiplier (nghìn, triệu, tỷ) and resets accumulators.
	 * Example: "hai trăm nghìn" → group=200, applyScale(1000) → total=200000
	 */
	const applyScale = (multiplier: number) => {
		current += group;
		total += current * multiplier;
		group = 0;
		current = 0;
	};

	for (const w of words) {
		if (digitMap[w] !== undefined) {
			// Base digit: overwrites current group position
			// For compound numbers, this adds to the units place
			const digit = digitMap[w];
			if (group >= 10) {
				// If we already have tens/hundreds, add to units (e.g., "hai mươi" + "lăm" → 25)
				group += digit;
			} else {
				// Otherwise, set the group value (e.g., "ba" → 3)
				group = digit;
			}
		} else if (w === "lẻ" || w === "linh") {
			// "lẻ" is a phonetic connector (e.g., "một trăm lẻ năm"), no numeric effect
		} else if (w === "mười") {
			// "mười" = exactly 10 (used for 10-19: mười, mười một, mười hai, etc.)
			group = 10;
		} else if (w === "mươi") {
			// "mươi" = tens multiplier (used for 20+: hai mươi, ba mươi, etc.)
			// Multiply current digit by 10 for tens place
			group *= 10;
		} else if (w === "trăm") {
			// Hundreds place: multiply current group by 100
			group *= 100;
		} else if (w === "nghìn" || w === "ngàn") {
			// Thousand scale: apply multiplier and reset
			applyScale(1_000);
		} else if (w === "triệu") {
			// Million scale
			applyScale(1_000_000);
		} else if (w === "tỷ") {
			// Billion scale
			applyScale(1_000_000_000);
		} else {
			throw new Error(`Unrecognized token: '${w}'`);
		}
	}

	// Add any remaining accumulated values
	return total + current + group;
}
