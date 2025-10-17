import { Select as BaseSelect } from "@base-ui-components/react/select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronsUpDown } from "lucide-react";
import { Fragment } from "react";
import { twMerge } from "tailwind-merge";

const selectTriggerVariants = cva(
	"font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold rounded-2xl bg-gold text-burgundy-dark hover:bg-gold border-2 border-transparent w-full flex items-center justify-between",
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
	"flex items-center gap-2 w-full text-left font-serif transition-colors duration-200 focus:outline-none bg-white/5 text-warm-cream hover:bg-gold hover:text-burgundy-dark focus:bg-gold focus:text-burgundy-dark data-[highlighted]:bg-gold data-[highlighted]:text-burgundy-dark border-b border-white/10 last:border-b-0",
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
	const PortalWrapper = usePortal ? BaseSelect.Portal : Fragment;

	return (
		<BaseSelect.Root value={value} onValueChange={handleValueChange}>
			<BaseSelect.Trigger
				className={twMerge(selectTriggerVariants({ size }), className)}
			>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 shrink-0" />
					<BaseSelect.Value>
						{selectedOption?.label || placeholder}
					</BaseSelect.Value>
				</div>
				<ChevronsUpDown className="ml-2 h-5 w-5 shrink-0" />
			</BaseSelect.Trigger>
			<PortalWrapper>
				<BaseSelect.Positioner sideOffset={4} className="z-50">
					<BaseSelect.Popup
						className={twMerge(
							"max-h-96 w-[var(--anchor-width)] overflow-y-auto rounded-2xl border border-gold bg-burgundy-dark shadow-xl focus:outline-none",
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
