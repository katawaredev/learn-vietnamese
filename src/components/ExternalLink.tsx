import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export type ExternalLinkProps = {
	text: string;
	href: string;
	className?: string;
};

export function ExternalLink({ text, href, className }: ExternalLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn("underline", className)}
		>
			{text}
			<ExternalLinkIcon className="ms-1 inline h-4 w-4 rtl:rotate-270deg" />
		</a>
	);
}
