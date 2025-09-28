import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cva } from "class-variance-authority";
import type { FC } from "react";

const buttonVariants = cva(
	"relative rounded-full border-0 flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
	{
		variants: {
			size: {
				small: "w-12 h-12",
				medium: "w-16 h-16",
				large: "w-20 h-20",
			},
		},
		defaultVariants: {
			size: "medium",
		},
	},
);

export interface InfoButtonProps {
	size?: "small" | "medium" | "large";
	onClick: () => void;
	disabled?: boolean;
}

export const InfoButton: FC<InfoButtonProps> = ({
	size = "medium",
	onClick,
	disabled = false,
}) => {
	return (
		<button
			type="button"
			className={`${buttonVariants({ size })} bg-green-500 shadow-green-500/25 hover:bg-green-600`}
			onClick={onClick}
			disabled={disabled}
			aria-label="Show pronunciation information"
		>
			<InformationCircleIcon
				className={`${
					size === "small"
						? "h-4 w-4"
						: size === "medium"
							? "h-6 w-6"
							: "h-8 w-8"
				} text-white`}
			/>
		</button>
	);
};
