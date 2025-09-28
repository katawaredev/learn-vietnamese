import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const dropdownMenuVariants = cva(
	"overflow-hidden rounded-2xl border border-gold bg-burgundy-dark py-1 shadow-lg",
	{
		variants: {
			size: {
				xs: "min-w-32",
				sm: "min-w-40",
				md: "min-w-48",
				lg: "min-w-64",
				xl: "min-w-80",
				"2xl": "min-w-96",
				auto: "w-auto",
				fit: "w-fit",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

interface DropdownMenuProps extends VariantProps<typeof dropdownMenuVariants> {
	children: ReactNode;
	className?: string;
	showPointer?: boolean;
	pointerPosition?: "left" | "center" | "right";
}

export function DropdownMenu({
	children,
	className,
	showPointer = true,
	pointerPosition = "center",
	size,
}: DropdownMenuProps) {
	const pointerClasses = {
		left: "left-4",
		center: "left-1/2 -translate-x-1/2",
		right: "right-4",
	};

	return (
		<div className={twMerge("relative", className)}>
			{/* Triangle pointer */}
			{showPointer && (
				<div
					className={twMerge(
						"-top-[13px] absolute transform",
						pointerClasses[pointerPosition],
					)}
				>
					<div className="w-4 overflow-hidden">
						<div className="h-4 w-4 translate-y-2 rotate-45 transform rounded-sm border border-gold bg-burgundy-dark"></div>
					</div>
				</div>
			)}
			{/* Dropdown container */}
			<div className={dropdownMenuVariants({ size, className })}>
				{children}
			</div>
		</div>
	);
}
