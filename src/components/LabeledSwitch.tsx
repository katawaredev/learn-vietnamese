import { type ReactNode, useId } from "react";
import { twMerge } from "tailwind-merge";
import { Switch, type SwitchProps } from "./Switch";

export interface LabeledSwitchProps extends SwitchProps {
	label: ReactNode;
	description?: string;
}

export function LabeledSwitch({
	label,
	description,
	className,
	id,
	...switchProps
}: LabeledSwitchProps) {
	const generatedId = useId();
	const switchId = id || generatedId;

	return (
		<label
			htmlFor={switchId}
			className={twMerge(
				"flex cursor-pointer items-center justify-between gap-4",
				className,
			)}
		>
			<div className="flex-1">
				<div className="font-medium font-serif text-gold text-sm">{label}</div>
				{description && (
					<p className="mt-1 font-serif text-warm-cream/60 text-xs">
						{description}
					</p>
				)}
			</div>
			<Switch id={switchId} {...switchProps} />
		</label>
	);
}
