import { Select as BaseSelect } from "@base-ui/react/select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronsUpDown } from "lucide-react";
import { Fragment } from "react";
import { twMerge } from "tailwind-merge";

const selectTriggerVariants = cva(
	"flex w-full items-center justify-between rounded-2xl border-2 border-transparent bg-gold font-serif text-burgundy-dark transition-all duration-200 hover:bg-gold focus:outline-none focus:ring-2 focus:ring-gold",
	{
		variants: {
			size: {
				small: "px-3 py-1.5 text-sm",
				medium: "px-4 py-2 text-lg",
				large: "px-6 py-4 text-2xl",
			},
		},
		defaultVariants: {
			size: "medium",
		},
	},
);

const selectItemVariants = cva(
	"flex w-full items-center gap-2 border-white/10 border-b bg-white/5 text-left font-serif text-warm-cream transition-colors duration-200 last:border-b-0 hover:bg-gold hover:text-burgundy-dark focus:bg-gold focus:text-burgundy-dark focus:outline-none data-[highlighted]:bg-gold data-[highlighted]:text-burgundy-dark",
	{
		variants: {
			size: {
				small: "px-3 py-1.5 text-sm",
				medium: "px-4 py-2 text-lg",
				large: "px-6 py-4 text-2xl",
			},
			disabled: {
				true: "cursor-not-allowed opacity-50",
				false: "cursor-pointer",
			},
		},
		defaultVariants: {
			size: "medium",
			disabled: false,
		},
	},
);

export interface SelectOption {
	label: string;
	value: string;
	disabled?: boolean;
}

export interface SelectProps
	extends VariantProps<typeof selectTriggerVariants> {
	options: SelectOption[];
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	className?: string;
	menuClassName?: string;
	itemClassName?: string;
	/**
	 * Whether to render the popup in a portal.
	 * Set to false when inside scrollable containers to prevent repositioning issues.
	 * @default true
	 */
	usePortal?: boolean;
}

export function Select({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	size,
	className,
	menuClassName,
	itemClassName,
	usePortal,
}: SelectProps) {
	const handleValueChange = (newValue: string | number | null) => {
		if (typeof newValue === "string") {
			onChange?.(newValue);
		}
	};

	const selectedOption = options.find((opt) => opt.value === value);
	const PortalWrapper = usePortal !== false ? BaseSelect.Portal : Fragment;

	// Calculate sideOffset based on size to create overlap effect
	const sideOffset = {
		small: -38,
		medium: -48,
		large: -68,
	}[size || "medium"];

	return (
		<BaseSelect.Root value={value} onValueChange={handleValueChange}>
			<BaseSelect.Trigger
				className={twMerge(selectTriggerVariants({ size }), className)}
			>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 shrink-0" />
					<BaseSelect.Value className="cursor-default">
						{selectedOption?.label || placeholder}
					</BaseSelect.Value>
				</div>
				<ChevronsUpDown className="ml-2 h-5 w-5 shrink-0" />
			</BaseSelect.Trigger>
			<PortalWrapper>
				<BaseSelect.Positioner
					sideOffset={sideOffset}
					className="z-50"
					positionMethod="fixed"
					alignItemWithTrigger={false}
					collisionAvoidance={{
						side: "none",
						align: "none",
					}}
				>
					<BaseSelect.Popup
						className={twMerge(
							"max-h-96 w-(--anchor-width) overflow-y-auto rounded-2xl border border-gold bg-burgundy-dark shadow-xl focus:outline-none",
							menuClassName,
						)}
					>
						<BaseSelect.List>
							{options.map((option) => (
								<BaseSelect.Item
									key={option.value}
									value={option.value}
									disabled={option.disabled}
									className={twMerge(
										selectItemVariants({ size, disabled: option.disabled }),
										itemClassName,
									)}
								>
									<Check
										className={`h-4 w-4 shrink-0 ${value === option.value ? "opacity-100" : "opacity-0"}`}
									/>
									{option.label}
								</BaseSelect.Item>
							))}
						</BaseSelect.List>
					</BaseSelect.Popup>
				</BaseSelect.Positioner>
			</PortalWrapper>
		</BaseSelect.Root>
	);
}
