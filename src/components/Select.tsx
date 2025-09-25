import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	type ListboxProps,
} from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

const selectVariants = cva(
	"font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-burgundy-dark rounded-2xl inline-flex items-center relative bg-gold text-burgundy-dark hover:bg-gold",
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

const selectMenuVariants = cva(
	"absolute left-0 top-full mt-2 min-w-full z-50 transition-all duration-200 focus:outline-none",
);

const selectItemVariants = cva(
	"block w-full text-left font-serif transition-colors duration-200 focus:outline-none text-warm-cream hover:bg-gold hover:text-burgundy-dark focus:bg-gold focus:text-burgundy-dark data-[focus]:bg-gold data-[focus]:text-burgundy-dark",
	{
		variants: {
			size: {
				small: "px-3 py-1 text-sm",
				medium: "px-4 py-1.5 text-base",
				large: "px-6 py-2 text-lg",
			},
		},
		defaultVariants: {
			size: "medium",
		},
	},
);

export interface SelectOption {
	label: string;
	value: string;
	disabled?: boolean;
}

export interface SelectProps
	extends VariantProps<typeof selectVariants>,
		Omit<ListboxProps, "value" | "onChange" | "children"> {
	options: SelectOption[];
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	className?: string;
	menuClassName?: string;
	itemClassName?: string;
	showChevron?: boolean;
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
	showChevron = true,
	...props
}: SelectProps) {
	const [selectedValue, setSelectedValue] = useState(value || "");

	const selectedOption = options.find(
		(option) => option.value === selectedValue,
	);

	const handleChange = (newValue: string) => {
		setSelectedValue(newValue);
		onChange?.(newValue);
	};

	return (
		<div className="relative inline-block">
			<Listbox value={selectedValue} onChange={handleChange} {...props}>
				<ListboxButton className={cn(selectVariants({ size }), className)}>
					<span className="flex-1 text-center">
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					{showChevron && (
						<ChevronDownIcon
							className="ml-2 h-5 w-5 transition-transform duration-200 data-[open]:rotate-180"
							aria-hidden="true"
						/>
					)}
				</ListboxButton>

				<ListboxOptions className={cn(selectMenuVariants(), menuClassName)}>
					<div className="relative">
						{/* Triangle pointer */}
						<div className="-top-[7px] -translate-x-1/2 absolute left-1/2 z-10 transform">
							<div className="h-0 w-0 border-r-[8px] border-r-transparent border-b-[8px] border-b-gold border-l-[8px] border-l-transparent"></div>
							<div className="-translate-x-1/2 absolute top-[2px] left-1/2 h-0 w-0 transform border-r-[6px] border-r-transparent border-b-[6px] border-b-burgundy-dark border-l-[6px] border-l-transparent"></div>
						</div>
						{/* Dropdown container */}
						<div className="overflow-hidden rounded-2xl border border-gold bg-burgundy-dark py-1 shadow-lg">
							{options.map((option) => (
								<ListboxOption
									key={option.value}
									value={option.value}
									disabled={option.disabled}
									className={cn(
										selectItemVariants({ size }),
										itemClassName,
										option.disabled
											? "cursor-not-allowed opacity-50"
											: undefined,
									)}
								>
									{option.label}
								</ListboxOption>
							))}
						</div>
					</div>
				</ListboxOptions>
			</Listbox>
		</div>
	);
}
