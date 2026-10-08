import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

const calloutVariants = cva(
	"flex items-center gap-3 rounded-lg border p-4 text-sm transition-colors",
	{
		variants: {
			variant: {
				note: "border-gold/30 bg-black/20 text-warm-cream/85",
				warning: "border-amber-400/40 bg-amber-500/10 text-amber-50",
				error: "border-red-400/50 bg-red-500/10 text-red-50",
			},
		},
		defaultVariants: { variant: "note" },
	},
);

const iconVariants = cva("h-5 w-5 shrink-0", {
	variants: {
		variant: {
			note: "text-gold",
			warning: "text-amber-300",
			error: "text-red-300",
		},
	},
	defaultVariants: { variant: "note" },
});

const VARIANT_ICON = {
	note: Info,
	warning: AlertTriangle,
	error: AlertCircle,
} as const;

export interface CalloutProps
	extends VariantProps<typeof calloutVariants>, Omit<ComponentProps<"div">, "children"> {
	children: ReactNode;
	dismissible?: boolean;
	defaultDismissed?: boolean;
	onDismiss?: () => void;
}

export function Callout({
	variant,
	dismissible = false,
	defaultDismissed = false,
	onDismiss,
	className,
	children,
	...props
}: CalloutProps) {
	const [dismissal, setDismissal] = useState({
		defaultDismissed,
		dismissed: defaultDismissed,
	});
	const defaultChanged = dismissal.defaultDismissed !== defaultDismissed;
	if (defaultChanged) {
		setDismissal({ defaultDismissed, dismissed: defaultDismissed });
	}
	const dismissed = defaultChanged ? defaultDismissed : dismissal.dismissed;

	if (dismissed) return null;

	const resolvedVariant = variant ?? "note";
	const Icon = VARIANT_ICON[resolvedVariant];

	return (
		<div
			role={resolvedVariant === "error" ? "alert" : "note"}
			className={twMerge(calloutVariants({ variant }), className)}
			{...props}
		>
			<Icon className={iconVariants({ variant })} aria-hidden="true" />
			<div className="flex-1">{children}</div>
			{dismissible && (
				<button
					type="button"
					onClick={() => {
						setDismissal({ defaultDismissed, dismissed: true });
						onDismiss?.();
					}}
					className="-m-1 shrink-0 rounded-sm p-1 opacity-60 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gold focus:outline-none"
					aria-label="Dismiss"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}
