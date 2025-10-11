import { Dices, Keyboard, Mic } from "lucide-react";
import { Toggle, ToggleGroup } from "~/components/ToggleGroup";

interface PracticeModeToggleProps {
	value: string[];
	onValueChange: (value: string[]) => void;
}

export function PracticeModeToggle({
	value,
	onValueChange,
}: PracticeModeToggleProps) {
	return (
		<ToggleGroup value={value} onValueChange={onValueChange}>
			<Toggle value="random" size="medium" orientation="horizontal">
				<Dices className="h-5 w-5" />
				<span>Random</span>
			</Toggle>
			<Toggle value="speak" size="medium" orientation="horizontal">
				<Mic className="h-5 w-5" />
				<span>Speak</span>
			</Toggle>
			<Toggle value="type" size="medium" orientation="horizontal">
				<Keyboard className="h-5 w-5" />
				<span>Type</span>
			</Toggle>
		</ToggleGroup>
	);
}
