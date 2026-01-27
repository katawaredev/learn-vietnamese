import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const switchRootVariants = cva(
	"relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				small: "h-6 w-10",
				medium: "h-8 w-14",
				large: "h-10 w-18",
			},
			checked: {
				true: "border-gold bg-gold",
				false: "border-gold bg-transparent",
			},
		},
		defaultVariants: {
			size: "medium",
			checked: false,
		},
	},
);

const switchThumbVariants = cva(
	"block rounded-full transition-all duration-200 ease-in-out",
	{
		variants: {
			size: {
				small: "h-4 w-4",
				medium: "h-6 w-6",
				large: "h-8 w-8",
			},
			checked: {
				true: "bg-burgundy-dark",
				false: "bg-gold",
			},
		},
		compoundVariants: [
			{
				size: "small",
				checked: true,
				className: "translate-x-5",
			},
			{
				size: "small",
				checked: false,
				className: "translate-x-0.5",
			},
			{
				size: "medium",
				checked: true,
				className: "translate-x-7",
			},
			{
				size: "medium",
				checked: false,
				className: "translate-x-0.5",
			},
			{
				size: "large",
				checked: true,
				className: "translate-x-9",
			},
			{
				size: "large",
				checked: false,
				className: "translate-x-0.5",
			},
		],
		defaultVariants: {
			size: "medium",
			checked: false,
		},
	},
);

export interface SwitchProps extends VariantProps<typeof switchRootVariants> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	id?: string;
	name?: string;
}

export function Switch({
	checked = false,
	onCheckedChange,
	disabled = false,
	size,
	className,
	id,
	name,
}: SwitchProps) {
	return (
		<BaseSwitch.Root
			checked={checked}
			onCheckedChange={onCheckedChange}
			disabled={disabled}
			className={twMerge(switchRootVariants({ size, checked }), className)}
			name={name}
			inputRef={(input) => {
				if (input && id) {
					input.id = id;
				}
			}}
		>
			<BaseSwitch.Thumb className={switchThumbVariants({ size, checked })} />
		</BaseSwitch.Root>
	);
}
