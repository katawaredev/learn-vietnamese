import { Checkbox } from "@base-ui/react/checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentType } from "react";
import { twMerge } from "tailwind-merge";

const toggleButtonVariants = cva(
	"flex cursor-pointer items-center justify-center gap-2 rounded-2xl font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold",
	{
		variants: {
			size: {
				small: "px-3 py-1.5 text-sm",
				medium: "px-4 py-2 text-lg",
				large: "px-6 py-4 text-2xl",
			},
			checked: {
				true: "border-2 border-transparent bg-gold text-burgundy-dark hover:bg-gold",
				false:
					"border-2 border-gold bg-transparent text-gold hover:bg-gold hover:text-burgundy",
			},
		},
		defaultVariants: {
			size: "medium",
			checked: false,
		},
	},
);

export interface ToggleButtonProps
	extends VariantProps<typeof toggleButtonVariants> {
	text: string;
	icon?: ComponentType<{ className?: string }>;
	activeText?: string;
	activeIcon?: ComponentType<{ className?: string }>;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
}

export function ToggleButton({
	text,
	icon: Icon,
	activeText,
	activeIcon: ActiveIcon,
	checked,
	onCheckedChange,
	size,
	className,
}: ToggleButtonProps) {
	const displayText = checked && activeText ? activeText : text;
	const DisplayIcon = checked ? ActiveIcon : Icon;

	return (
		<Checkbox.Root
			checked={checked}
			onCheckedChange={onCheckedChange}
			className={twMerge(toggleButtonVariants({ size, checked }), className)}
		>
			{(Icon || ActiveIcon) && (
				<span className="flex h-6 w-6 items-center justify-center">
					{DisplayIcon && <DisplayIcon className="h-6 w-6" />}
				</span>
			)}
			{displayText}
		</Checkbox.Root>
	);
}
