import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface DisclosureProps {
	title: ReactNode;
	children: ReactNode;
	className?: string;
	defaultOpen?: boolean;
	plain?: boolean;
}

export function Disclosure({
	title,
	children,
	className,
	defaultOpen = false,
	plain = false,
}: DisclosureProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<Collapsible.Root
			open={open}
			onOpenChange={setOpen}
			className={twMerge("mb-6", className)}
		>
			<div
				className={
					plain
						? ""
						: "overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/20"
				}
			>
				<Collapsible.Trigger
					className={twMerge(
						"flex w-full items-center justify-between text-left",
						plain ? "py-2" : "px-6 py-4",
					)}
				>
					<div className="flex items-center gap-4 text-gold">{title}</div>
					<ChevronDown
						className={`h-5 w-5 text-gold transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
					/>
				</Collapsible.Trigger>

				<Collapsible.Panel
					className={twMerge(
						"data-closed:fade-out-0 data-open:fade-in-0 data-closed:slide-out-to-top-2 data-open:slide-in-from-top-2 data-closed:animate-out data-open:animate-in",
						plain ? "pt-2" : "border-white/10 border-t px-6 py-4",
					)}
				>
					{children}
				</Collapsible.Panel>
			</div>
		</Collapsible.Root>
	);
}
