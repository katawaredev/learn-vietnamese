import { Collapsible } from "@base-ui-components/react/collapsible";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface DisclosureProps {
	title: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
}

export function Disclosure({
	title,
	children,
	defaultOpen = false,
}: DisclosureProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<Collapsible.Root open={open} onOpenChange={setOpen} className="mb-6">
			<div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/20">
				<Collapsible.Trigger className="flex w-full items-center justify-between px-6 py-4 text-left">
					<div className="flex items-center gap-4">{title}</div>
					<ChevronDown
						className={`h-5 w-5 text-gold transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
					/>
				</Collapsible.Trigger>

				<Collapsible.Panel className="data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:slide-out-to-top-2 data-[open]:slide-in-from-top-2 border-white/10 border-t px-6 py-4 data-[closed]:animate-out data-[open]:animate-in">
					{children}
				</Collapsible.Panel>
			</div>
		</Collapsible.Root>
	);
}
