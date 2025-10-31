/**
 * Vietnamese time utilities.
 *
 * Vietnamese time format:
 * - Hours: number + "giờ" (e.g., "2 giờ" = 2 o'clock)
 * - Minutes: number + "phút" (e.g., "30 phút" = 30 minutes)
 * - Full time: "[hours] giờ [minutes] phút" (e.g., "2 giờ 30 phút" = 2:30)
 * - Quarter/half: "rưỡi" (half past), "kém" (to/before)
 *
 * Time of day expressions:
 * - Morning: sáng (6-11am)
 * - Noon: trưa (11am-1pm)
 * - Afternoon: chiều (1-6pm)
 * - Evening: tối (6-10pm)
 * - Night: đêm/khuya (10pm-6am)
 *
 * Duration units (how long something takes):
 * - giây: second(s)
 * - phút: minute(s)
 * - giờ: hour(s)
 * - ngày: day(s)
 * - tuần: week(s)
 * - tháng: month(s)
 * - năm: year(s)
 */

import { numberToText } from "./numeric";

/** Duration units in Vietnamese */
export const DURATION_UNITS = {
	giây: "second(s)",
	phút: "minute(s)",
	giờ: "hour(s)",
	ngày: "day(s)",
	tuần: "week(s)",
	tháng: "month(s)",
	năm: "year(s)",
} as const;

export type DurationUnit = keyof typeof DURATION_UNITS;

/** Time of day periods */
export const TIME_PERIODS = {
	sáng: "morning", // 6-11am
	trưa: "noon", // 11am-1pm
	chiều: "afternoon", // 1-6pm
	tối: "evening", // 6-10pm
	đêm: "night", // 10pm-6am
	khuya: "late night", // alternative for late night
} as const;

export type TimePeriod = keyof typeof TIME_PERIODS;

/**
 * Gets the Vietnamese time period for a given hour (0-23).
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Vietnamese time period
 */
export function getTimePeriod(hour: number): TimePeriod {
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
		throw new RangeError("Hour must be between 0 and 23");
	}

	if (hour >= 6 && hour < 11) return "sáng";
	if (hour >= 11 && hour < 13) return "trưa";
	if (hour >= 13 && hour < 18) return "chiều";
	if (hour >= 18 && hour < 22) return "tối";
	return "đêm";
}

/**
 * Converts hour to 12-hour format for Vietnamese (1-12).
 * Vietnamese typically uses 12-hour format with time period markers.
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Hour in 12-hour format (1-12)
 */
export function to12Hour(hour: number): number {
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
		throw new RangeError("Hour must be between 0 and 23");
	}
	const h12 = hour % 12;
	return h12 === 0 ? 12 : h12;
}

/**
 * Formats time in Vietnamese.
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param use24Hour - Use 24-hour format (default: false)
 * @returns Vietnamese time string (e.g., "2 giờ 30 phút sáng")
 */
export function formatTime(
	hour: number,
	minute: number,
	use24Hour = false,
): string {
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
		throw new RangeError("Hour must be between 0 and 23");
	}
	if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
		throw new RangeError("Minute must be between 0 and 59");
	}

	const displayHour = use24Hour ? hour : to12Hour(hour);
	const hourText = numberToText(displayHour);

	const parts = [hourText, "giờ"];

	// Add minutes if not zero
	if (minute > 0) {
		if (minute === 30) {
			parts.push("rưỡi"); // "half past" special case
		} else if (minute === 15) {
			parts.push("mười lăm phút"); // quarter past
		} else if (minute === 45) {
			parts.push("bốn mươi lăm phút"); // quarter to next hour
		} else {
			parts.push(numberToText(minute), "phút");
		}
	}

	// Add time period for 12-hour format
	if (!use24Hour) {
		parts.push(getTimePeriod(hour));
	}

	return parts.join(" ");
}

/**
 * Formats time using colloquial expressions when applicable.
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Colloquial time expression
 */
export function formatTimeColloquial(hour: number, minute: number): string {
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
		throw new RangeError("Hour must be between 0 and 23");
	}
	if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
		throw new RangeError("Minute must be between 0 and 59");
	}

	const displayHour = to12Hour(hour);
	const period = getTimePeriod(hour);

	// Special case: on the hour
	if (minute === 0) {
		return `${numberToText(displayHour)} giờ ${period}`;
	}

	// Special case: half past
	if (minute === 30) {
		return `${numberToText(displayHour)} giờ rưỡi ${period}`;
	}

	// Special case: quarter past/to
	if (minute === 15) {
		return `${numberToText(displayHour)} giờ mười lăm ${period}`;
	}

	// Default format
	return formatTime(hour, minute, false);
}

/**
 * Simple hour formatting (just "X giờ").
 * @param hour - Hour (0-23)
 * @param use24Hour - Use 24-hour format (default: false)
 * @returns Vietnamese hour (e.g., "2 giờ")
 */
export function formatHour(hour: number, use24Hour = false): string {
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
		throw new RangeError("Hour must be between 0 and 23");
	}

	const displayHour = use24Hour ? hour : to12Hour(hour);
	return `${numberToText(displayHour)} giờ`;
}

/**
 * Simple minute formatting (just "X phút").
 * @param minute - Minute (0-59)
 * @returns Vietnamese minute (e.g., "30 phút")
 */
export function formatMinute(minute: number): string {
	if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
		throw new RangeError("Minute must be between 0 and 59");
	}

	if (minute === 30) return "rưỡi";
	return `${numberToText(minute)} phút`;
}

/**
 * Formats a duration with Vietnamese unit.
 * @param value - Numeric value
 * @param unit - Duration unit (giây, phút, giờ, ngày, tuần, tháng, năm)
 * @returns Vietnamese duration (e.g., "hai giờ" = 2 hours, "ba ngày" = 3 days)
 */
export function formatDuration(value: number, unit: DurationUnit): string {
	if (!Number.isInteger(value) || value < 0) {
		throw new RangeError("Duration value must be a non-negative integer");
	}
	return `${numberToText(value)} ${unit}`;
}
