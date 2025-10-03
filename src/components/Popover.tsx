import { Popover as BasePopover } from "@base-ui-components/react/popover";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface PopoverProps {
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
	buttonClassName?: string;
	defaultOpen?: boolean;
}

export function Popover({
	trigger,
	children,
	className,
	buttonClassName,
	defaultOpen = false,
}: PopoverProps) {
	return (
		<BasePopover.Root defaultOpen={defaultOpen}>
			<BasePopover.Trigger
				className={twMerge(
					"rounded-full p-1 text-gold transition-colors hover:text-warm-cream focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark",
					buttonClassName,
				)}
			>
				{trigger}
			</BasePopover.Trigger>

			<BasePopover.Portal>
				<BasePopover.Positioner sideOffset={8} align="center">
					<BasePopover.Popup
						className={twMerge(
							"z-50 rounded-2xl border border-gold bg-burgundy-dark p-4 shadow-xl focus:outline-none",
							className,
						)}
					>
						<BasePopover.Arrow className="data-[side=bottom]:-top-[6px] data-[side=top]:-bottom-[6px] data-[side=left]:-right-[13px] data-[side=right]:-left-[13px] data-[side=right]:-rotate-90 data-[side=left]:rotate-90 data-[side=top]:rotate-180">
							<div className="h-3 w-3 rotate-45 rounded-tl-sm border-gold border-t border-l bg-burgundy-dark" />
						</BasePopover.Arrow>
						{children}
					</BasePopover.Popup>
				</BasePopover.Positioner>
			</BasePopover.Portal>
		</BasePopover.Root>
	);
}
