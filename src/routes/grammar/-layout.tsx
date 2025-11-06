import type { ReactNode } from "react";
import {
	ModuleLayout,
	type ModuleRoute,
	type NavigationHelpers,
} from "~/layout/ModuleLayout";

export const grammarRoutes: ModuleRoute[] = [
	{ label: "Classifiers", path: "/grammar/classifiers" },
	{ label: "Sentence Structure", path: "/grammar/sentence-structure" },
	{ label: "Tenses", path: "/grammar/tenses" },
	{ label: "Questions", path: "/grammar/questions" },
	{ label: "Negatives", path: "/grammar/negatives" },
	{ label: "Conditionals", path: "/grammar/conditionals" },
	{ label: "Commands", path: "/grammar/commands" },
	{ label: "Exclamations", path: "/grammar/exclamations" },
	{ label: "Word Order", path: "/grammar/word-order" },
	{ label: "Focus Markers", path: "/grammar/focus-markers" },
	{ label: "Demonstratives", path: "/grammar/demonstratives" },
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
