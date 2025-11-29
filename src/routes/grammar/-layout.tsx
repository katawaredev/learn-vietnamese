import type { ReactNode } from "react";
import {
	ModuleLayout,
	type ModuleRoute,
	type NavigationHelpers,
} from "~/layout/ModuleLayout";

export const grammarRoutes: ModuleRoute[] = [
	// Foundation
	{ label: "Sentence Structure", path: "/grammar/sentence-structure" },
	{ label: "Tenses", path: "/grammar/tenses" },

	// Core concepts
	{ label: "Classifiers", path: "/grammar/classifiers" },
	{ label: "Questions", path: "/grammar/questions" },
	{ label: "Negatives", path: "/grammar/negatives" },
	{ label: "Commands", path: "/grammar/commands" },

	// Modifiers and descriptions
	{ label: "Demonstratives", path: "/grammar/demonstratives" },
	{ label: "Adjectives", path: "/grammar/adjectives" },
	{ label: "Comparatives", path: "/grammar/comparatives" },

	// Advanced structures
	{ label: "Conditionals", path: "/grammar/conditionals" },
	{ label: "Passive Voice", path: "/grammar/passive-voice" },
	{ label: "Modal Verbs", path: "/grammar/modal-verbs" },
	{ label: "Focus Markers", path: "/grammar/focus-markers" },

	// Expression
	{ label: "Exclamations", path: "/grammar/exclamations" },
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
