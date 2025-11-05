import { Link, type LinkComponent } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const buttonVariants = cva(
	"rounded-2xl font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold",
	{
		variants: {
			variant: {
				default:
					"border-2 border-transparent bg-gold text-burgundy-dark hover:bg-gold",
				outline:
					"border-2 border-gold bg-transparent text-gold hover:bg-gold hover:text-burgundy",
				ghost:
					"border-2 border-transparent bg-transparent text-gold hover:bg-gold/10 hover:text-warm-cream",
			},
			size: {
				small: "px-3 py-1.5 text-sm",
				medium: "px-4 py-2 text-lg",
				large: "px-6 py-4 text-2xl",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "medium",
		},
	},
);

export interface ButtonProps
	extends VariantProps<typeof buttonVariants>,
		ComponentProps<"button"> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
	return (
		<button
			{...props}
			className={twMerge(buttonVariants({ variant, size }), className)}
		/>
	);
}

export interface LinkButtonProps
	extends VariantProps<typeof buttonVariants>,
		Omit<ComponentProps<LinkComponent<"a">>, "href"> {}

export function LinkButton({
	variant,
	size,
	className,
	...props
}: LinkButtonProps) {
	return (
		<Link
			{...props}
			className={twMerge(
				buttonVariants({ variant, size }),
				"block text-center",
				className,
			)}
		/>
	);
}
