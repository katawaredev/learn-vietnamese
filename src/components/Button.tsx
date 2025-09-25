import {
	Button as HeadlessButton,
	type ButtonProps as HeadlessButtonProps,
} from "@headlessui/react";
import { Link, type LinkComponent } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
	"font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold rounded-2xl",
	{
		variants: {
			variant: {
				default:
					"bg-gold text-burgundy-dark hover:bg-gold border-2 border-transparent",
				outline:
					"bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-burgundy",
				ghost:
					"bg-transparent text-gold hover:text-warm-cream hover:bg-gold/10 border-2 border-transparent",
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
		HeadlessButtonProps {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
	return (
		<HeadlessButton
			{...props}
			className={cn(buttonVariants({ variant, size }), className)}
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
