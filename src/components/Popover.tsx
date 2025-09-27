import {
	Popover as HeadlessPopover,
	type PopoverProps as HeadlessPopoverProps,
	PopoverButton,
	PopoverPanel,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

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
					<div className="relative">
						{/* Triangle pointer */}
						<div className="-top-[13px] -translate-x-1/2 absolute left-1/2 z-10 transform">
							<div className="w-4 overflow-hidden">
								<div className="h-4 w-4 translate-y-2 rotate-45 transform rounded-sm border border-gold bg-burgundy-dark"></div>
							</div>
						</div>
						{/* Popover container */}
						<div className="overflow-hidden rounded-2xl border border-gold bg-burgundy-dark py-1 shadow-lg">
							<div className="p-4">{children}</div>
						</div>
					</div>
				</PopoverPanel>
			</HeadlessPopover>
		</div>
	);
}
