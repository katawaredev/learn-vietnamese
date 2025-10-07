import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeftRight,
	BookOpen,
	GraduationCap,
	ListOrdered,
	MessageCircle,
	MessageSquare,
	Pencil,
	Puzzle,
	ScrollText,
	Users,
	Volume2,
} from "lucide-react";
import { LinkButton } from "~/components/Button";
import Header from "~/layout/Header";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const learningModules = [
		{ name: "Pronunciation", icon: Volume2, to: "/pronunciation" },
		{ name: "Relations", icon: ArrowLeftRight, to: "/relations" },
		{ name: "Numbers", icon: ListOrdered, to: "/numbers" },
		{ name: "Grammar", icon: Puzzle, to: "/grammar" },
		{ name: "Phrases", icon: MessageSquare, to: "/phrases" },
		{ name: "Reading", icon: ScrollText, to: "/reading" },
		{ name: "Dictation", icon: Pencil, to: "/dictation" },
		{ name: "Vocabulary", icon: BookOpen, to: "/vocabulary" },
		{ name: "Live Conversation", icon: Users, to: "/conversation" },
		{ name: "AI Chat", icon: MessageCircle, to: "/chat" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header hideBackButton />

			{/* Main Content */}
			<main className="px-6 pb-8">
				<div className="mx-auto max-w-md space-y-6">
					{learningModules.map((module) => {
						const IconComponent = module.icon;
						return (
							<LinkButton
								key={module.name}
								variant="default"
								size="large"
								to={module.to}
								className="flex w-full items-center justify-center gap-4 font-medium"
							>
								<IconComponent className="h-6 w-6" />
								{module.name}
							</LinkButton>
						);
					})}
					<LinkButton
						variant="default"
						size="large"
						to="https://vietnameselessons.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex w-full items-center justify-center gap-4 font-medium"
					>
						<GraduationCap className="h-6 w-6" />
						Study resources
					</LinkButton>
				</div>
			</main>
		</div>
	);
}
