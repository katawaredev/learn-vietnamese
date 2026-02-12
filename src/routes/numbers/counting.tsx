import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { PracticeGrid } from "~/layout/PracticeGrid";
import { numberToText } from "~/utils/numeric";
import { Layout } from "./-layout";

export const Route = createFileRoute("/numbers/counting")({
	component: CountingComponent,
});

interface NumberData {
	value: number;
}

/**
 * Generates a data object for PracticeGrid from an array of numbers.
 * Key = Vietnamese text, value = { value: number }
 */
function generateNumberData(numbers: number[]): Record<string, NumberData> {
	return numbers.reduce(
		(acc, num) => {
			const text = numberToText(num);
			acc[text] = { value: num };
			return acc;
		},
		{} as Record<string, NumberData>,
	);
}

function CountingComponent() {
	// Define number groups for progressive learning
	const basicDigits = generateNumberData([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	const teens = generateNumberData([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
	const tensAndSpecial = generateNumberData([
		20, 21, 25, 30, 31, 35, 40, 50, 60, 70, 80, 90,
	]);
	const hundreds = generateNumberData([100, 105, 200, 215, 225, 300, 500]);
	const thousands = generateNumberData([
		1_000, 1_500, 2_000, 10_000, 25_000, 100_000,
	]);
	const large = generateNumberData([
		1_000_000, 10_000_000, 100_000_000, 1_000_000_000,
	]);

	/**
	 * Provides explanatory details for specific numbers that have special rules.
	 */
	const getDetails = (_text: string, item: NumberData) => {
		const num = item.value;

		switch (num) {
			case 0:
				return { Note: "Also means 'No' / 'None'" };
			case 1:
				return {
					Note: "Base form 'một' becomes 'mốt' in units position after mươi (e.g., 21, 31)",
				};
			case 5:
				return {
					Note: "Base form 'năm' becomes 'lăm' in units position after mươi (e.g., 15, 25)",
				};
			case 10:
				return { Rule: "Uses 'mười' (not 'một mươi')" };
			case 15:
				return { Rule: "Uses 'lăm' instead of 'năm': 'mười lăm'" };
			case 21:
				return { Rule: "Uses 'mốt' instead of 'một': 'hai mươi mốt'" };
			case 25:
				return { Rule: "Uses 'lăm' instead of 'năm': 'hai mươi lăm'" };
			case 105:
				return {
					Rule: "Uses 'lẻ' to bridge hundreds and units when tens = 0: 'một trăm lẻ năm'",
				};
			default:
				if (num >= 20 && num < 100 && num % 10 === 0)
					return { Rule: "Tens use 'mươi': [digit] + mươi" };
				return undefined;
		}
	};

	return (
		<Layout>
			<Disclosure
				className="w-full"
				title={
					<span className="font-bold text-gold text-lg">Number Rules</span>
				}
			>
				<div className="space-y-4">
					<p>
						Vietnamese numbers follow a{" "}
						<strong className="text-gold">
							base-10 system with special pronunciation rules
						</strong>{" "}
						that change based on position. Understanding these patterns is key
						to reading and writing numbers correctly.
					</p>

					<ul className="mt-2 ml-6 list-disc space-y-2">
						<li>
							<strong>Structure:</strong> Numbers are grouped by thousands
							(nghìn), millions (triệu), billions (tỷ). Within each 3-digit
							group: [hundreds trăm] [tens mươi/mười] [units]
						</li>
						<li>
							<strong>"lẻ" connector:</strong> After hundreds (trăm), if tens=0
							but units exist, add "lẻ" (e.g., 105 = "một trăm lẻ năm")
						</li>
						<li>
							<strong>Ten vs tens:</strong> 10 uses "mười" (not "một mươi"). For
							20-90, use [digit] + "mươi" (e.g., 20 = "hai mươi")
						</li>
						<li>
							<strong>"mốt" for 1:</strong> In units position after mươi, "một"
							becomes "mốt" (e.g., 21 = "hai mươi mốt", not "hai mươi một")
						</li>
						<li>
							<strong>"lăm" for 5:</strong> In units position after mười/mươi,
							"năm" becomes "lăm" (e.g., 15 = "mười lăm", 25 = "hai mươi lăm")
						</li>
						<li>
							<strong>Zero handling:</strong> Middle zeros in large numbers are
							handled by scale words (nghìn, triệu, tỷ)
						</li>
					</ul>

					<p>
						<strong>Read more:</strong>{" "}
						<a
							href="https://en.wikipedia.org/wiki/Vietnamese_numerals"
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							Wikipedia: Vietnamese numerals
						</a>
					</p>
				</div>
			</Disclosure>

			<div className="space-y-8">
				{/* Basic Digits */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">Basic Digits (0-9)</h2>
						<p className="text-sm text-white/60">Foundation for all numbers</p>
					</div>
					<PracticeGrid<NumberData>
						data={basicDigits}
						getSubtitle={(item) => item.value.toString()}
						getDetails={getDetails}
					/>
				</div>

				{/* Teens */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">Teens (10-19)</h2>
						<p className="text-sm text-white/60">
							Uses "mười" prefix (not "một mươi")
						</p>
					</div>
					<PracticeGrid<NumberData>
						data={teens}
						getSubtitle={(item) => item.value.toString()}
						getDetails={getDetails}
					/>
				</div>

				{/* Tens and Special Cases */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">
							Tens & Special Cases (20-90)
						</h2>
						<p className="text-sm text-white/60">
							Notice "mốt" (21) and "lăm" (25, 35) variations
						</p>
					</div>
					<PracticeGrid<NumberData>
						data={tensAndSpecial}
						getSubtitle={(item) => item.value.toString()}
						getDetails={getDetails}
					/>
				</div>

				{/* Hundreds */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">Hundreds (100-900)</h2>
						<p className="text-sm text-white/60">
							Watch for "lẻ" when tens = 0 (e.g., 105)
						</p>
					</div>
					<PracticeGrid<NumberData>
						data={hundreds}
						size="medium"
						getSubtitle={(item) => item.value.toString()}
						getDetails={getDetails}
					/>
				</div>

				{/* Thousands */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">
							Thousands (1K-100K)
						</h2>
						<p className="text-sm text-white/60">Scale word: "nghìn"</p>
					</div>
					<PracticeGrid<NumberData>
						data={thousands}
						size="medium"
						getSubtitle={(item) => item.value.toLocaleString()}
						getDetails={getDetails}
					/>
				</div>

				{/* Large Numbers */}
				<div>
					<div className="mb-4">
						<h2 className="font-bold text-2xl text-gold">
							Large Numbers (1M-1B)
						</h2>
						<p className="text-sm text-white/60">
							Scale words: "triệu" (million), "tỷ" (billion)
						</p>
					</div>
					<PracticeGrid<NumberData>
						data={large}
						size="medium"
						getSubtitle={(item) => item.value.toLocaleString()}
						getDetails={getDetails}
					/>
				</div>
			</div>
		</Layout>
	);
}
