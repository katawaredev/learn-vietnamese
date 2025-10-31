/**
 * Vietnamese date and calendar utilities.
 *
 * Vietnamese dates follow this structure:
 * - Days: "ngày" + number (1-31)
 * - Months: "tháng" + number (1-12)
 * - Years: "năm" + number
 * - Full date: "ngày [day] tháng [month] năm [year]"
 *
 * Days of week use ordinal numbers (thứ):
 * - Monday = thứ hai (literally "second day")
 * - Sunday = Chủ nhật (special case, not thứ một)
 */

import { numberToText } from "./numeric";

/** Vietnamese month names (tháng một = January, etc.) */
export const MONTHS = [
	"tháng một",
	"tháng hai",
	"tháng ba",
	"tháng tư",
	"tháng năm",
	"tháng sáu",
	"tháng bảy",
	"tháng tám",
	"tháng chín",
	"tháng mười",
	"tháng mười một",
	"tháng mười hai",
] as const;

/** Vietnamese day names (Monday-Sunday) */
export const DAYS_OF_WEEK = [
	"thứ hai", // Monday
	"thứ ba", // Tuesday
	"thứ tư", // Wednesday
	"thứ năm", // Thursday
	"thứ sáu", // Friday
	"thứ bảy", // Saturday
	"Chủ nhật", // Sunday (special case)
] as const;

/**
 * Converts a month number (1-12) to Vietnamese text.
 * @param month - Month number (1 = January, 12 = December)
 * @returns Vietnamese month name (e.g., "tháng một" for January)
 */
export function monthToText(month: number): string {
	if (!Number.isInteger(month) || month < 1 || month > 12) {
		throw new RangeError("Month must be between 1 and 12");
	}
	return MONTHS[month - 1];
}

/**
 * Converts a day of week (0-6) to Vietnamese text.
 * @param day - Day of week (0 = Monday, 6 = Sunday)
 * @returns Vietnamese day name (e.g., "thứ hai" for Monday)
 */
export function dayOfWeekToText(day: number): string {
	if (!Number.isInteger(day) || day < 0 || day > 6) {
		throw new RangeError("Day must be between 0 (Monday) and 6 (Sunday)");
	}
	return DAYS_OF_WEEK[day];
}

/**
 * Formats a complete date in Vietnamese.
 * @param day - Day of month (1-31)
 * @param month - Month (1-12)
 * @param year - Year (optional)
 * @returns Full Vietnamese date (e.g., "ngày một tháng năm năm hai nghìn hai mươi bốn")
 */
export function formatDate(day: number, month: number, year?: number): string {
	if (!Number.isInteger(day) || day < 1 || day > 31) {
		throw new RangeError("Day must be between 1 and 31");
	}
	if (!Number.isInteger(month) || month < 1 || month > 12) {
		throw new RangeError("Month must be between 1 and 12");
	}

	const parts = ["ngày", numberToText(day), monthToText(month)];

	if (year !== undefined) {
		if (!Number.isInteger(year) || year < 0) {
			throw new RangeError("Year must be a non-negative integer");
		}
		parts.push("năm", numberToText(year));
	}

	return parts.join(" ");
}

/**
 * Formats a date with day of week.
 * @param dayOfWeek - Day of week (0 = Monday, 6 = Sunday)
 * @param day - Day of month (1-31)
 * @param month - Month (1-12)
 * @param year - Year (optional)
 * @returns Full date with day of week (e.g., "thứ hai, ngày một tháng năm")
 */
export function formatDateWithDayOfWeek(
	dayOfWeek: number,
	day: number,
	month: number,
	year?: number,
): string {
	return `${dayOfWeekToText(dayOfWeek)}, ${formatDate(day, month, year)}`;
}

/**
 * Parses Vietnamese month text back to number.
 * @param text - Vietnamese month name
 * @returns Month number (1-12)
 */
export function parseMonth(text: string): number {
	const normalized = text.toLowerCase().trim();
	const index = MONTHS.indexOf(normalized);
	if (index === -1) {
		throw new Error(`Invalid month: ${text}`);
	}
	return index + 1;
}

/**
 * Parses Vietnamese day of week text back to number.
 * @param text - Vietnamese day name
 * @returns Day number (0 = Monday, 6 = Sunday)
 */
export function parseDayOfWeek(text: string): number {
	const normalized = text.toLowerCase().trim();
	const index = DAYS_OF_WEEK.findIndex((d) => d.toLowerCase() === normalized);
	if (index === -1) {
		throw new Error(`Invalid day of week: ${text}`);
	}
	return index;
}
