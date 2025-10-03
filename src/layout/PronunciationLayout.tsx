import { useNavigate } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";
import { LinkButton } from "~/components/Button";
import { Select } from "~/components/Select";
import Header from "./Header";

interface PronunciationLayoutProps {
	children: ReactNode;
	currentRoute: string;
	customNavigation?: ReactNode;
}

export const pronunciationRoutes = [
	{ value: "vowels", label: "Vowels", path: "/pronunciation/vowels" },
	{
		value: "double-vowels",
		label: "Double Vowels",
		path: "/pronunciation/double-vowels",
	},
	{
		value: "consonants",
		label: "Consonants",
		path: "/pronunciation/consonants",
	},
	{ value: "tones", label: "Tones", path: "/pronunciation/tones" },
	{
		value: "tones-vowel",
		label: "Tones by vowel",
		path: "/pronunciation/tones-vowel",
	},
	{
		value: "practice",
		label: "Practice",
		path: "/pronunciation/practice",
	},
];

export const PronunciationLayout: FC<PronunciationLayoutProps> = ({
	children,
	currentRoute,
	customNavigation,
}) => {
	const navigate = useNavigate();

	const currentIndex = pronunciationRoutes.findIndex(
		(route) => route.value === currentRoute,
	);
	const prevRoute =
		currentIndex > 0 ? pronunciationRoutes[currentIndex - 1] : null;
	const nextRoute =
		currentIndex < pronunciationRoutes.length - 1
			? pronunciationRoutes[currentIndex + 1]
			: null;

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header>
				<Select
					placeholder="Select Category"
					className="min-w-32"
					size="small"
					options={pronunciationRoutes.map((route) => ({
						label: route.label,
						value: route.value,
					}))}
					value={currentRoute}
					onChange={(value) => {
						const route = pronunciationRoutes.find((r) => r.value === value);
						if (route) {
							navigate({ to: route.path });
						}
					}}
				/>
			</Header>

			<main className="flex flex-1 flex-col px-4 pb-8">
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center">
					{children}
				</div>

				{/* Navigation area */}
				<div className="mx-auto w-full max-w-4xl pt-12">
					{customNavigation || (
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
