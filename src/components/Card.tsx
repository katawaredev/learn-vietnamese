import type React from "react";
import { twMerge } from "tailwind-merge";

export function Card<T extends React.ElementType = "div">({
	as,
	className,
	children,
	...props
}: {
	as?: T;
	className?: string;
	children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">) {
	const Component = as || "div";
	return (
		<Component
			className={twMerge(
				"group relative rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20",
				className,
			)}
			{...props}
		>
			{children}
		</Component>
	);
}
