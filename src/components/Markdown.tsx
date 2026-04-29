import { Fragment } from "react";

const TOKEN_RE =
	/(\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|\*[^*\n]+\*|`[^`\n]+`)/g;

interface MarkdownProps {
	text: string;
	className?: string;
}

/**
 * Renders a small subset of inline Markdown:
 *   `**bold**` / `__bold__`, `*italic*`, `~~strike~~`, `` `code` ``.
 * Block-level syntax (lists, headers, links) is intentionally not supported —
 * this is just for short prose strings stored in JSON content.
 */
export function Markdown({ text, className }: MarkdownProps) {
	const parts = text.split(TOKEN_RE);
	return (
		<span className={className}>
			{parts.map((part, i) => {
				if (!part) return null;
				const key = `${i}-${part}`;
				if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
					return <strong key={key}>{part.slice(2, -2)}</strong>;
				}
				if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
					return <strong key={key}>{part.slice(2, -2)}</strong>;
				}
				if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
					return (
						<s key={key} className="opacity-60">
							{part.slice(2, -2)}
						</s>
					);
				}
				if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
					return <code key={key}>{part.slice(1, -1)}</code>;
				}
				if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
					return <em key={key}>{part.slice(1, -1)}</em>;
				}
				return <Fragment key={key}>{part}</Fragment>;
			})}
		</span>
	);
}
