import {
	DisclosureButton,
	DisclosurePanel,
	Disclosure as HeadlessDisclosure,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

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
	return (
		<HeadlessDisclosure as="div" className="mb-6" defaultOpen={defaultOpen}>
			{({ open }) => (
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/20">
					<DisclosureButton className="flex w-full items-center justify-between px-6 py-4 text-left">
						<div className="flex items-center gap-4">{title}</div>
						<ChevronDownIcon
							className={`h-5 w-5 text-gold transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
						/>
					</DisclosureButton>

					<DisclosurePanel className="border-white/10 border-t px-6 py-4">
						{children}
					</DisclosurePanel>
				</div>
			)}
		</HeadlessDisclosure>
	);
}
