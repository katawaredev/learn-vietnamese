import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";
import { LinkButton } from "~/components/Button";
import { Select } from "~/components/Select";
import Header from "./Header";

export interface ModuleRoute {
	label: string;
	path: string;
}

export interface NavigationHelpers {
	prevRoute: ModuleRoute | null;
	nextRoute: ModuleRoute | null;
	routes: ModuleRoute[];
}

interface ModuleLayoutProps {
	routes: ModuleRoute[];
	children: ReactNode;
	customNavigation?: ReactNode | ((helpers: NavigationHelpers) => ReactNode);
}

export const ModuleLayout: FC<ModuleLayoutProps> = ({
	routes,
	children,
	customNavigation,
}) => {
	const navigate = useNavigate();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const currentIndex = routes.findIndex((route) => route.path === currentPath);
	const prevRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
	const nextRoute =
		currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null;

	const helpers: NavigationHelpers = { prevRoute, nextRoute, routes };

	const renderedNavigation =
		typeof customNavigation === "function"
			? customNavigation(helpers)
			: customNavigation;

	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-burgundy-dark to-burgundy">
			<Header>
				<Select
					placeholder="Select Category"
					className="min-w-32"
					size="small"
					options={routes.map((route) => ({
						label: route.label,
						value: route.path,
					}))}
					value={currentPath}
					onChange={(path) => {
						navigate({ to: path });
					}}
				/>
			</Header>

			<main className="flex flex-1 flex-col px-4 pb-8">
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center">
					{children}
				</div>

				{/* Navigation area */}
				<div className="mx-auto w-full max-w-4xl pt-12">
					{renderedNavigation || (
						<div className="grid grid-cols-[1fr_6rem_1fr] gap-4">
							{prevRoute ? (
								<LinkButton variant="outline" size="medium" to={prevRoute.path}>
									← {prevRoute.label}
								</LinkButton>
							) : (
								<div />
							)}
							<div />
							{nextRoute ? (
								<LinkButton variant="outline" size="medium" to={nextRoute.path}>
									{nextRoute.label} →
								</LinkButton>
							) : (
								<div />
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};
