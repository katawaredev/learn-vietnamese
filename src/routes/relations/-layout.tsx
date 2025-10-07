import type { ReactNode } from "react";
import {
	ModuleLayout,
	type ModuleRoute,
	type NavigationHelpers,
} from "~/layout/ModuleLayout";

export const grammarRoutes: ModuleRoute[] = [
	{ label: "Pronouns", path: "/relations/pronouns" },
	{ label: "Practice", path: "/relations/practice" },
];

interface LayoutProps {
	children: ReactNode;
	customNavigation?: ReactNode | ((helpers: NavigationHelpers) => ReactNode);
}

export function Layout({ children, customNavigation }: LayoutProps) {
	return (
		<ModuleLayout routes={grammarRoutes} customNavigation={customNavigation}>
			{children}
		</ModuleLayout>
	);
}
