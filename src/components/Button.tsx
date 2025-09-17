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
	"px-4 py-2 font-serif text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold rounded-2xl",
	{
		variants: {
			variant: {
				default: "bg-gold text-burgundy-dark hover:bg-gold",
				outline:
					"bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-burgundy",
				ghost:
					"bg-transparent text-gold hover:text-warm-cream hover:bg-gold/10",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface ButtonProps
	extends VariantProps<typeof buttonVariants>,
		HeadlessButtonProps {}

export function Button({ variant, className, ...props }: ButtonProps) {
	return (
		<HeadlessButton
			{...props}
			className={cn(buttonVariants({ variant }), className)}
		/>
	);
}

export interface LinkButtonProps
	extends VariantProps<typeof buttonVariants>,
		Omit<ComponentProps<LinkComponent<"a">>, "href"> {}

export function LinkButton({ variant, className, ...props }: LinkButtonProps) {
	return (
		<Link
			{...props}
			className={twMerge(
				buttonVariants({ variant }),
				"block text-center",
				className,
			)}
		/>
	);
}
