import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface DropdownMenuProps {
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
						"-top-[13px] absolute z-10 transform",
						pointerClasses[pointerPosition],
					)}
				>
					<div className="w-4 overflow-hidden">
						<div className="h-4 w-4 translate-y-2 rotate-45 transform rounded-sm border border-gold bg-burgundy-dark"></div>
					</div>
				</div>
			)}
			{/* Dropdown container */}
			<div className="overflow-hidden rounded-2xl border border-gold bg-burgundy-dark py-1 shadow-lg">
				{children}
			</div>
		</div>
	);
}
