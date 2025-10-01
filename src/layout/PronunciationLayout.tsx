import { useNavigate } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";
import { LinkButton } from "~/components/Button";
import { Select } from "~/components/Select";
import Header from "./Header";

interface PronunciationLayoutProps {
	children: ReactNode;
	currentRoute: string;
}

const pronunciationRoutes = [
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
];

export const PronunciationLayout: FC<PronunciationLayoutProps> = ({
	children,
	currentRoute,
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
		<div className="min-h-screen bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header>
				<Select
					placeholder="Select Category"
					className="min-w-32"
					menuSize="sm"
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

			<main className="px-4 pb-8">
				<div className="mx-auto max-w-6xl">
					{children}

					<div className="mx-auto flex max-w-4xl gap-8 px-4 pt-12">
						{prevRoute ? (
							<LinkButton
								variant="outline"
								size="medium"
								to={prevRoute.path}
								className="w-full"
							>
								← {prevRoute.label}
							</LinkButton>
						) : (
							<div className="w-full" />
						)}
						{nextRoute ? (
							<LinkButton
								variant="outline"
								size="medium"
								to={nextRoute.path}
								className="w-full"
							>
								{nextRoute.label} →
							</LinkButton>
						) : (
							<div className="w-full" />
						)}
					</div>
				</div>
			</main>
		</div>
	);
};
