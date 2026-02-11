import {
	Separator as BaseSeparator,
	type SeparatorProps as BaseSeparatorProps,
} from "@base-ui/react/separator";
import { twMerge } from "tailwind-merge";

export interface SeparatorProps extends BaseSeparatorProps {
	className?: string;
}

export function Separator({
	className,
	orientation = "horizontal",
	...props
}: SeparatorProps) {
	return (
		<BaseSeparator
			orientation={orientation}
			className={twMerge("border-white/10 border-t", className)}
			{...props}
		/>
	);
}
