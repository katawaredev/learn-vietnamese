import { WordInputMultiple } from "./WordInputMultiple";
import { WordInputSingle } from "./WordInputSingle";

export interface WordInputProps {
	text: string;
	hint?: string;
	onChange?: (text: string) => void;
	className?: string;
}

export const WordInput = ({ text, ...props }: WordInputProps) => {
	if (text.includes(" ")) return <WordInputMultiple text={text} {...props} />;
	return <WordInputSingle text={text} {...props} />;
};
