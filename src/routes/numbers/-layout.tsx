import type { ReactNode } from "react";
import {
	ModuleLayout,
	type ModuleRoute,
	type NavigationHelpers,
} from "~/layout/ModuleLayout";

export const numbersRoutes: ModuleRoute[] = [
	{ label: "Counting", path: "/numbers/counting" },
	{ label: "Dates", path: "/numbers/dates" },
	{ label: "Time", path: "/numbers/time" },
	{ label: "Practice", path: "/numbers/practice" },
];

interface LayoutProps {
	children: ReactNode;
	customNavigation?: ReactNode | ((helpers: NavigationHelpers) => ReactNode);
}

export function Layout({ children, customNavigation }: LayoutProps) {
	return (
		<ModuleLayout routes={numbersRoutes} customNavigation={customNavigation}>
			{children}
		</ModuleLayout>
	);
}
