import { twMerge } from "tailwind-merge";

/**
 * Merges class names handling both string and function variants.
 * Useful for components that accept className as either a string or a function.
 */
export function cn<TState = Record<string, unknown>>(
	baseClassName: string,
	className?: string | ((state: TState) => string),
	...additionalClasses: (string | undefined | null | boolean)[]
): string | ((state: TState) => string) {
	if (typeof className === "function") {
		return (state: TState) =>
			twMerge(
				baseClassName,
				className(state),
				...(additionalClasses.filter(Boolean) as string[]),
			);
	}
	return twMerge(
		baseClassName,
		className,
		...(additionalClasses.filter(Boolean) as string[]),
	);
}
