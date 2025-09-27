import {
	Popover as HeadlessPopover,
	type PopoverProps as HeadlessPopoverProps,
	PopoverButton,
	PopoverPanel,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";
import { DropdownMenu } from "./DropdownMenu";

interface PopoverProps extends Omit<HeadlessPopoverProps, "children"> {
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
	buttonClassName?: string;
	panelClassName?: string;
}

export function Popover({
	trigger,
	children,
	className,
	buttonClassName,
	panelClassName,
	...props
}: PopoverProps) {
	return (
		<div className="relative inline-block">
			<HeadlessPopover className={cn("relative", className)} {...props}>
				<PopoverButton
					className={cn(
						"rounded-full p-1 text-gold transition-colors hover:text-warm-cream focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark",
						buttonClassName,
					)}
				>
					{trigger}
				</PopoverButton>

				<PopoverPanel
					className={cn(
						"absolute top-full left-1/2 z-50 mt-2 min-w-full transition-all duration-200 focus:outline-none",
						panelClassName,
					)}
				>
					<DropdownMenu>
						<div className="p-4">{children}</div>
					</DropdownMenu>
				</PopoverPanel>
			</HeadlessPopover>
		</div>
	);
}
