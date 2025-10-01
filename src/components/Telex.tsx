import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TelexProps {
	text: string;
}

export function Telex({ text }: TelexProps) {
	return (
		<span className="inline-flex items-center gap-1">
			<code>{text}</code>
			<a
				href="https://en.wikipedia.org/wiki/Telex_(input_method)"
				target="_blank"
				rel="noopener noreferrer"
				className="ml-2 text-blue-300"
				title="Learn more"
			>
				<InformationCircleIcon className="h-4 w-4" />
			</a>
		</span>
	);
}
