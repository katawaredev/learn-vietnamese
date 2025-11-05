import { Toggle as BaseToggle } from "@base-ui-components/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui-components/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const toggleGroupVariants = cva(
	"inline-flex overflow-hidden border-2 border-gold",
	{
		variants: {
			orientation: {
				horizontal: "flex-row rounded-2xl",
				vertical: "flex-col rounded-2xl",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
		},
	},
);

const toggleVariants = cva(
	"flex cursor-pointer items-center justify-center gap-2 border-gold font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-inset",
	{
		variants: {
			size: {
				small: "px-3 py-1.5 text-sm",
				medium: "px-4 py-2 text-lg",
				large: "px-6 py-4 text-2xl",
			},
			orientation: {
				horizontal: "border-r-2 last:border-r-0",
				vertical: "border-b-2 last:border-b-0",
			},
		},
		defaultVariants: {
			size: "medium",
			orientation: "horizontal",
		},
	},
);

export interface ToggleGroupProps
	extends Omit<ComponentProps<typeof BaseToggleGroup>, "orientation">,
		VariantProps<typeof toggleGroupVariants> {
	className?: string;
}

export interface ToggleProps
	extends ComponentProps<typeof BaseToggle>,
		VariantProps<typeof toggleVariants> {
	className?: string;
}

export function ToggleGroup({
	orientation = "horizontal",
	className,
	children,
	...props
}: ToggleGroupProps) {
	return (
		<BaseToggleGroup
			{...props}
			className={twMerge(toggleGroupVariants({ orientation }), className)}
		>
			{children}
		</BaseToggleGroup>
	);
}

export function Toggle({
	size,
	orientation,
	className,
	...props
}: ToggleProps) {
	return (
		<BaseToggle
			{...props}
			className={twMerge(
				toggleVariants({ size, orientation }),
				"data-[pressed]:bg-gold data-[pressed]:text-burgundy-dark",
				"bg-transparent text-gold hover:bg-gold hover:text-burgundy-dark",
				"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				className,
			)}
		/>
	);
}
