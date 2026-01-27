import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { DAYS_OF_WEEK, formatDate, MONTHS } from "~/utils/dates";
import { Layout } from "./-layout";

export const Route = createFileRoute("/numbers/dates")({
	component: DatesComponent,
});

interface DateData {
	value: string;
	type: "month" | "day" | "date";
	numericValue?: number | { day: number; month: number; year?: number };
}

/**
 * Generates month data for PracticeGrid.
 */
function generateMonthData(): Record<string, DateData> {
	return MONTHS.reduce(
		(acc, month, index) => {
			acc[month] = {
				value: month,
				type: "month",
				numericValue: index + 1,
			};
			return acc;
		},
		{} as Record<string, DateData>,
	);
}

/**
 * Generates day of week data for PracticeGrid.
 */
function generateDayData(): Record<string, DateData> {
	return DAYS_OF_WEEK.reduce(
		(acc, day, index) => {
			acc[day] = {
				value: day,
				type: "day",
				numericValue: index,
			};
			return acc;
		},
		{} as Record<string, DateData>,
	);
}

/**
 * Generates sample date data for PracticeGrid.
 */
function generateSampleDates(): Record<string, DateData> {
	const samples: Array<{ day: number; month: number; year?: number }> = [
		{ day: 1, month: 1 }, // New Year
		{ day: 14, month: 2 }, // Valentine's
		{ day: 1, month: 5 }, // May Day
		{ day: 2, month: 9 }, // Vietnam Independence
		{ day: 25, month: 12 }, // Christmas
		{ day: 1, month: 1, year: 2024 }, // With year
		{ day: 15, month: 8, year: 2025 }, // With year
	];

	return samples.reduce(
		(acc, date) => {
			const text = formatDate(date.day, date.month, date.year);
			acc[text] = {
				value: text,
				type: "date",
				numericValue: date,
			};
			return acc;
		},
		{} as Record<string, DateData>,
	);
}

function DatesComponent() {
	const months = generateMonthData();
	const days = generateDayData();
	const sampleDates = generateSampleDates();

	/**
	 * Provides explanatory details for dates.
	 */
	const getDetails = (_text: string, item: DateData) => {
		if (item.type === "day" && typeof item.numericValue === "number") {
			if (item.numericValue === 6) {
				// Sunday - special case
				return {
					Note: 'Special: "Chủ nhật" is a religious term, not an ordinal',
				};
			}
			return undefined; // Pattern already explained in section header
		}

		return undefined; // Other patterns are self-explanatory
	};

	return (
		<Layout>
			<div className="space-y-8">
				{/* Days of Week */}
				<div>
					<Disclosure
						className="mb-4 w-full"
						title={
							<span className="font-bold text-2xl text-gold">
								Days of Week (Thứ trong tuần)
							</span>
						}
					>
						<div className="space-y-3">
							<p>
								<strong className="text-gold">Days of week</strong> use ordinal
								numbers with the "thứ" prefix: thứ hai (Monday, literally
								"second day"), thứ ba (Tuesday, "third day"), etc.
							</p>

							<p>
								<strong className="text-gold">Sunday exception:</strong> Sunday
								is "Chủ nhật" (a special religious term), not "thứ một"
							</p>

							<p className="text-sm text-white/80">
								<strong>Cultural note:</strong> The Vietnamese week
								traditionally starts with Monday (thứ hai), not Sunday. This is
								why Monday is "second day" - it's the second day counting from
								Sunday as the first.
							</p>
						</div>
					</Disclosure>
					<PracticeGrid<DateData>
						data={days}
						getSubtitle={(item) =>
							[
								"Monday",
								"Tuesday",
								"Wednesday",
								"Thursday",
								"Friday",
								"Saturday",
								"Sunday",
							][item.numericValue as number]
						}
						getDetails={getDetails}
					/>
				</div>

				{/* Months */}
				<div>
					<Disclosure
						className="mb-4 w-full"
						title={
							<span className="font-bold text-2xl text-gold">
								Months (Tháng trong năm)
							</span>
						}
					>
						<div className="space-y-3">
							<p>
								<strong className="text-gold">Simple pattern:</strong> "tháng" +
								number (1-12)
							</p>

							<p>
								January = "tháng một", February = "tháng hai", December = "tháng
								mười hai"
							</p>
						</div>
					</Disclosure>
					<PracticeGrid<DateData>
						data={months}
						getSubtitle={(item) => {
							const monthNames = [
								"January",
								"February",
								"March",
								"April",
								"May",
								"June",
								"July",
								"August",
								"September",
								"October",
								"November",
								"December",
							];
							return monthNames[(item.numericValue as number) - 1];
						}}
						getDetails={getDetails}
					/>
				</div>

				{/* Full Dates */}
				<div>
					<Disclosure
						className="mb-4 w-full"
						title={
							<span className="font-bold text-2xl text-gold">
								Full Dates (Ngày tháng năm)
							</span>
						}
					>
						<div className="space-y-3">
							<p>
								<strong className="text-gold">Date format:</strong> ngày [day]
								tháng [month] năm [year]
							</p>

							<ul className="ml-6 list-disc space-y-2">
								<li>
									<strong>Day numbers (1-31):</strong> Use cardinal numbers, not
									ordinals. Unlike English "1st, 2nd, 3rd", Vietnamese uses
									"ngày một, ngày hai, ngày ba"
								</li>
								<li>
									<strong>Years:</strong> Read as full numbers (e.g., 2024 =
									"năm hai nghìn hai mươi bốn")
								</li>
								<li>
									<strong>Optional year:</strong> Can omit "năm [year]" when
									context is clear
								</li>
							</ul>

							<p className="text-sm text-white/80">
								<strong>Cultural note:</strong> Vietnamese also use the lunar
								calendar for traditional holidays and celebrations alongside the
								Gregorian calendar.
							</p>
						</div>
					</Disclosure>
					<PracticeGrid<DateData>
						data={sampleDates}
						size="large"
						getSubtitle={(item) => {
							if (
								typeof item.numericValue === "object" &&
								item.numericValue !== null
							) {
								const { day, month, year } = item.numericValue;
								const monthNames = [
									"Jan",
									"Feb",
									"Mar",
									"Apr",
									"May",
									"Jun",
									"Jul",
									"Aug",
									"Sep",
									"Oct",
									"Nov",
									"Dec",
								];
								return year
									? `${monthNames[month - 1]} ${day}, ${year}`
									: `${monthNames[month - 1]} ${day}`;
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
