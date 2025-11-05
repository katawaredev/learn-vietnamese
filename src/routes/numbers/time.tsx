import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { PracticeGrid } from "~/layout/PracticeGrid";
import {
	DURATION_UNITS,
	type DurationUnit,
	formatDuration,
	formatTime,
	TIME_PERIODS,
} from "~/utils/time";
import { Layout } from "./-layout";

export const Route = createFileRoute("/numbers/time")({
	component: TimeComponent,
});

interface TimeData {
	value: string;
	type: "period" | "duration" | "time";
	unit?: DurationUnit | "rưỡi";
	numericValue?: number | { hour: number; minute: number };
}

/**
 * Generates time period data.
 */
function generateTimePeriodData(): Record<string, TimeData> {
	return Object.entries(TIME_PERIODS).reduce(
		(acc, [viet]) => {
			acc[viet] = {
				value: viet,
				type: "period",
			};
			return acc;
		},
		{} as Record<string, TimeData>,
	);
}

/**
 * Generates duration unit vocabulary (just the unit words).
 */
function generateDurationUnits(): Record<string, TimeData> {
	return (
		Object.entries(DURATION_UNITS) as Array<[DurationUnit, string]>
	).reduce(
		(acc, [unit]) => {
			acc[unit] = {
				value: unit,
				type: "duration",
				unit,
			};
			return acc;
		},
		{
			rưỡi: {
				value: "rưỡi",
				type: "duration",
				unit: "rưỡi",
			},
		} as Record<string, TimeData>,
	);
}

/**
 * Generates comprehensive examples combining time telling and durations.
 */
function generateExamples(): Record<string, TimeData> {
	const data: Record<string, TimeData> = {};

	// Clock time examples - variety across different periods
	const timeExamples: Array<{ hour: number; minute: number }> = [
		{ hour: 7, minute: 0 }, // Morning - on the hour
		{ hour: 8, minute: 30 }, // Morning - rưỡi
		{ hour: 9, minute: 15 }, // Morning - quarter past
		{ hour: 12, minute: 0 }, // Noon - on the hour
		{ hour: 14, minute: 30 }, // Afternoon - rưỡi
		{ hour: 15, minute: 45 }, // Afternoon - quarter to
		{ hour: 18, minute: 0 }, // Evening - on the hour
		{ hour: 20, minute: 20 }, // Evening - regular minutes
		{ hour: 22, minute: 30 }, // Night - rưỡi
	];

	for (const time of timeExamples) {
		const text = formatTime(time.hour, time.minute, false);
		data[text] = {
			value: text,
			type: "time",
			numericValue: time,
		};
	}

	// Duration examples - variety for each unit type
	const durationExamples: Array<{ value: number; unit: DurationUnit }> = [
		{ value: 10, unit: "giây" },
		{ value: 45, unit: "giây" },
		{ value: 5, unit: "phút" },
		{ value: 20, unit: "phút" },
		{ value: 1, unit: "giờ" },
		{ value: 3, unit: "giờ" },
		{ value: 1, unit: "ngày" },
		{ value: 7, unit: "ngày" },
		{ value: 2, unit: "tuần" },
		{ value: 4, unit: "tuần" },
		{ value: 3, unit: "tháng" },
		{ value: 12, unit: "tháng" },
		{ value: 1, unit: "năm" },
		{ value: 5, unit: "năm" },
	];

	for (const dur of durationExamples) {
		const text = formatDuration(dur.value, dur.unit);
		data[text] = {
			value: text,
			type: "duration",
			unit: dur.unit,
			numericValue: dur.value,
		};
	}

	// Special: rưỡi in different contexts
	data["một giờ rưỡi"] = {
		value: "một giờ rưỡi",
		type: "duration",
		unit: "rưỡi",
		numericValue: 1.5,
	};
	data["ba giờ rưỡi"] = {
		value: "ba giờ rưỡi",
		type: "duration",
		unit: "rưỡi",
		numericValue: 3.5,
	};

	return data;
}

function TimeComponent() {
	const periods = generateTimePeriodData();
	const durationUnits = generateDurationUnits();
	const examples = generateExamples();

	/**
	 * Provides explanatory details for time elements.
	 */
	const getDetails = (_text: string, item: TimeData) => {
		if (item.type === "period") {
			const periodInfo: Record<string, { time: string; note?: string }> = {
				sáng: { time: "6:00 AM - 11:00 AM" },
				trưa: { time: "11:00 AM - 1:00 PM" },
				chiều: { time: "1:00 PM - 6:00 PM" },
				tối: { time: "6:00 PM - 10:00 PM" },
				đêm: { time: "10:00 PM - 6:00 AM" },
				khuya: {
					time: "Late night/early morning",
					note: "Alternative for đêm, emphasizes lateness",
				},
			};

			const info = periodInfo[item.value];
			if (info) {
				const details: Record<string, string> = {
					"Time range": info.time,
				};
				if (info.note) {
					details.Note = info.note;
				}
				return details;
			}
		}

		if (item.type === "duration") {
			// For unit vocabulary (no numeric value)
			if (!item.numericValue) {
				if (item.unit === "rưỡi") {
					return {
						Meaning: "half / half past",
						"Clock time": '"hai giờ rưỡi" = 2:30',
						Duration: '"hai giờ rưỡi" = 2.5 hours',
					};
				}

				return undefined; // No details needed for simple units
			}

			// For complete duration examples
			if (item.unit === "rưỡi") {
				return {
					Note: "Same word for clock time (2:30) and duration (2.5 hours)",
				};
			}

			return undefined; // Pattern is obvious from the example itself
		}

		if (
			item.type === "time" &&
			typeof item.numericValue === "object" &&
			item.numericValue !== null
		) {
			const { minute } = item.numericValue;

			const details: Record<string, string> = {};

			if (minute === 30) {
				details.Note = 'Special: "rưỡi" instead of "ba mươi phút"';
			} else if (minute === 0) {
				details.Note = "On the hour - omit minute part";
			}

			return Object.keys(details).length > 0 ? details : undefined;
		}

		return undefined;
	};

	return (
		<Layout>
			<div className="space-y-8">
				{/* Time Periods */}
				<div>
					<Disclosure
						className="mb-4 w-full"
						title={
							<span className="font-bold text-2xl text-gold">
								Time Periods (Buổi trong ngày)
							</span>
						}
					>
						<div className="space-y-3">
							<p>
								<strong className="text-gold">Time periods</strong> indicate
								what part of the day: sáng (morning), trưa (noon), chiều
								(afternoon), tối (evening), đêm (night).
							</p>

							<p>
								<strong className="text-gold">Clock time format:</strong> [hour]
								giờ [minutes] phút [period]
							</p>

							<ul className="ml-6 list-disc space-y-2">
								<li>
									<strong>"rưỡi" for half past:</strong> Use "rưỡi" instead of
									"ba mươi phút" (e.g., "hai giờ rưỡi" = 2:30)
								</li>
								<li>
									<strong>On the hour:</strong> Omit minutes (e.g., "bảy giờ
									sáng" = 7:00 AM)
								</li>
								<li>
									<strong>12-hour format:</strong> Vietnamese typically uses
									12-hour format with period markers, not AM/PM
								</li>
							</ul>
						</div>
					</Disclosure>
					<PracticeGrid<TimeData>
						data={periods}
						getSubtitle={(item) =>
							TIME_PERIODS[item.value as keyof typeof TIME_PERIODS]
						}
						getDetails={getDetails}
					/>
				</div>

				{/* Duration Units */}
				<div>
					<Disclosure
						className="mb-4 w-full"
						title={
							<span className="font-bold text-2xl text-gold">
								Duration Units (Đơn vị thời gian)
							</span>
						}
					>
						<div className="space-y-3">
							<p>
								<strong className="text-gold">Duration</strong> (how long
								something takes) uses a simple pattern: number + unit word
							</p>

							<p>
								<strong>Units:</strong> giây (second), phút (minute), giờ
								(hour), ngày (day), tuần (week), tháng (month), năm (year)
							</p>

							<p>
								Same vocabulary works for both clock time and duration. Context
								determines meaning.
							</p>
						</div>
					</Disclosure>
					<PracticeGrid<TimeData>
						data={durationUnits}
						getSubtitle={(item) => {
							if (item.unit === "rưỡi") {
								return "half / half past";
							}
							return DURATION_UNITS[item.unit as DurationUnit];
						}}
						getDetails={getDetails}
					/>
				</div>

				{/* Examples */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">
							Usage Examples (Ví dụ)
						</h2>
						<p className="text-sm text-white/60">
							Clock time (telling time) and duration (how long) - both using the
							same vocabulary
						</p>
					</div>
					<PracticeGrid<TimeData>
						data={examples}
						getSubtitle={(item) => {
							if (
								item.type === "time" &&
								typeof item.numericValue === "object" &&
								item.numericValue !== null
							) {
								const { hour, minute } = item.numericValue;
								const h12 = hour % 12 || 12;
								const ampm = hour < 12 ? "AM" : "PM";
								return `${h12}:${minute.toString().padStart(2, "0")} ${ampm}`;
							}
							if (item.type === "duration" && item.unit) {
								if (item.unit === "rưỡi") {
									return "2.5 hours";
								}
								if (typeof item.numericValue === "number") {
									return `${item.numericValue} ${DURATION_UNITS[item.unit as DurationUnit]}`;
								}
							}
							return "";
						}}
						getDetails={getDetails}
					/>
				</div>
			</div>
		</Layout>
	);
}
