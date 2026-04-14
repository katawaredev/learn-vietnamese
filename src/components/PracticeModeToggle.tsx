import { ArrowUpDown, Dices, Keyboard, Mic } from "lucide-react";
import { Toggle, ToggleGroup } from "~/components/ToggleGroup";

interface PracticeModeToggleProps {
	value: string[];
	onValueChange: (value: string[]) => void;
	showArrange?: boolean;
}

export function PracticeModeToggle({
	value,
	onValueChange,
	showArrange = false,
}: PracticeModeToggleProps) {
	return (
		<ToggleGroup value={value} onValueChange={onValueChange}>
			<Toggle value="random" size="medium" orientation="horizontal">
				<Dices className="h-5 w-5" />
				<span className={showArrange ? "hidden sm:inline" : undefined}>
					Random
				</span>
			</Toggle>
			{showArrange && (
				<Toggle value="arrange" size="medium" orientation="horizontal">
					<ArrowUpDown className="h-5 w-5" />
					<span className="hidden sm:inline">Arrange</span>
				</Toggle>
			)}
			<Toggle value="speak" size="medium" orientation="horizontal">
				<Mic className="h-5 w-5" />
				<span className={showArrange ? "hidden sm:inline" : undefined}>
					Speak
				</span>
			</Toggle>
			<Toggle value="type" size="medium" orientation="horizontal">
				<Keyboard className="h-5 w-5" />
				<span className={showArrange ? "hidden sm:inline" : undefined}>
					Type
				</span>
			</Toggle>
		</ToggleGroup>
	);
}
