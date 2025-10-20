import type { FC } from "react";

interface StateIndicatorProps {
	/** Current state of the component */
	state: "processing" | "active" | null;
	/** Loading progress percentage (0-100) */
	loadingProgress?: number;
	/** Color theme for the indicator */
	theme: "stone" | "sky";
}

// Theme color mappings
const themeColors = {
	stone: {
		spinnerBg: "border-stone-600/30",
		spinnerFg: "border-t-stone-300",
		progressBg: "text-stone-600/30",
		progressFg: "text-stone-300",
		activeBorder: "border-red-500/60",
	},
	sky: {
		spinnerBg: "border-sky-600/30",
		spinnerFg: "border-t-sky-200",
		progressBg: "text-sky-600/30",
		progressFg: "text-sky-200",
		activeBorder: "border-sky-500/60",
	},
};

export const StateIndicator: FC<StateIndicatorProps> = ({
	state,
	loadingProgress = 0,
	theme,
}) => {
	const colors = themeColors[theme];
	const strokeDashoffset = 100 - loadingProgress;

	// Processing state with spinner or circular progress
	if (state === "processing") {
		// Show spinner when no progress or fully loaded
		if (loadingProgress === 0 || loadingProgress === 100) {
			return (
				<div
					className={`absolute inset-1 animate-spin rounded-full border-2 ${colors.spinnerBg} ${colors.spinnerFg}`}
				/>
			);
		}

		// Show circular progress indicator
		if (loadingProgress > 0 && loadingProgress < 100) {
			return (
				<svg
					className="-rotate-90 absolute inset-1"
					viewBox="0 0 36 36"
					xmlns="http://www.w3.org/2000/svg"
					aria-label={`Loading model: ${loadingProgress}%`}
				>
					<title>Loading model: {loadingProgress}%</title>
					{/* Background Circle */}
					<circle
						cx="18"
						cy="18"
						r="17.5"
						fill="none"
						className={`stroke-current ${colors.progressBg}`}
						strokeWidth="1"
					/>
					{/* Progress Circle */}
					<circle
						cx="18"
						cy="18"
						r="17.5"
						fill="none"
						className={`stroke-current ${colors.progressFg} transition-all duration-300`}
						strokeWidth="1"
						strokeDasharray="100"
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
					/>
				</svg>
			);
		}
	}

	// Active state (recording/speaking)
	if (state === "active") {
		return (
			<div
				className={`-inset-1 absolute animate-ping rounded-full border-2 ${colors.activeBorder}`}
			/>
		);
	}

	return null;
};
