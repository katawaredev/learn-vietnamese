import type { ReactNode } from "react";
import {
	ModuleLayout,
	type ModuleRoute,
	type NavigationHelpers,
} from "~/layout/ModuleLayout";

export const pronunciationRoutes: ModuleRoute[] = [
	{ label: "Vowels", path: "/pronunciation/vowels" },
	{ label: "Double Vowels", path: "/pronunciation/double-vowels" },
	{ label: "Consonants", path: "/pronunciation/consonants" },
	{ label: "Tones", path: "/pronunciation/tones" },
	{ label: "Tones by Vowel", path: "/pronunciation/tones-vowel" },
	{ label: "Practice", path: "/pronunciation/practice" },
];

interface LayoutProps {
	children: ReactNode;
	customNavigation?: ReactNode | ((helpers: NavigationHelpers) => ReactNode);
}

export function Layout({ children, customNavigation }: LayoutProps) {
	return (
		<ModuleLayout
			routes={pronunciationRoutes}
			customNavigation={customNavigation}
		>
			{children}
		</ModuleLayout>
	);
}
