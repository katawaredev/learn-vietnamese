import {
	Popover as HeadlessPopover,
	type PopoverProps as HeadlessPopoverProps,
	PopoverButton,
	PopoverPanel,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { DropdownMenu } from "./DropdownMenu";

interface PopoverProps extends Omit<HeadlessPopoverProps, "children"> {
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
	buttonClassName?: string;
	panelClassName?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "auto" | "fit";
}

export function Popover({
	trigger,
	children,
	className,
	buttonClassName,
	panelClassName,
	size = "md",
	...props
}: PopoverProps) {
	const [position, setPosition] = useState("center");
	const buttonRef = useRef<HTMLButtonElement>(null);

	const updatePosition = () => {
		if (!buttonRef.current) return;

		const rect = buttonRef.current.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const panelWidth =
			size === "xs"
				? 128
				: size === "sm"
					? 160
					: size === "md"
						? 192
						: size === "lg"
							? 256
							: size === "xl"
								? 320
								: size === "2xl"
									? 384
									: 192;

		// Check if centered position would overflow
		const centerLeft = rect.left + rect.width / 2 - panelWidth / 2;
		const centerRight = centerLeft + panelWidth;

		if (centerLeft < 16) {
			// Too close to left edge
			setPosition("left");
		} else if (centerRight > viewportWidth - 16) {
			// Too close to right edge
			setPosition("right");
		} else {
			setPosition("center");
		}
	};

	const getPositionClasses = () => {
		if (panelClassName) return panelClassName;

		switch (position) {
			case "left":
				return "left-0";
			case "right":
				return "right-0";
			default:
				return "left-1/2 -translate-x-1/2";
		}
	};

	const getPointerPosition = () => {
		switch (position) {
			case "left":
				return "left";
			case "right":
				return "right";
			default:
				return "center";
		}
	};

	return (
		<div className="relative inline-block">
			<HeadlessPopover className={cn("relative", className)} {...props}>
				<PopoverButton
					ref={buttonRef}
					onClick={updatePosition}
					className={cn(
						"rounded-full p-1 text-gold transition-colors hover:text-warm-cream focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark",
						buttonClassName,
					)}
				>
					{trigger}
				</PopoverButton>

				<PopoverPanel
					className={cn(
						"absolute top-full z-50 mt-2 transition-all duration-200 focus:outline-none",
						getPositionClasses(),
					)}
				>
					<DropdownMenu size={size} pointerPosition={getPointerPosition()}>
						<div className="p-4">{children}</div>
					</DropdownMenu>
				</PopoverPanel>
			</HeadlessPopover>
		</div>
	);
}
