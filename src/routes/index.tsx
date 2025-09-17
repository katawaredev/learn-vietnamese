import {
	BookOpenIcon,
	ChatBubbleLeftRightIcon,
	DocumentTextIcon,
	HandRaisedIcon,
	HashtagIcon,
	PencilSquareIcon,
	PresentationChartLineIcon,
	SpeakerWaveIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { LinkButton } from "~/components/Button";
import Header from "~/layout/Header";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const learningModules = [
		{ name: "Pronunciation", icon: SpeakerWaveIcon, to: "/pronunciation" },
		{ name: "Greetings", icon: HandRaisedIcon, to: "/greetings" },
		{ name: "Numbers", icon: HashtagIcon, to: "/numbers" },
		{ name: "Grammar", icon: BookOpenIcon, to: "/grammar" },
		{ name: "Phrases", icon: ChatBubbleLeftRightIcon, to: "/phrases" },
		{ name: "Reading", icon: DocumentTextIcon, to: "/reading" },
		{ name: "Dictation", icon: PencilSquareIcon, to: "/dictation" },
		{ name: "Vocabulary", icon: PresentationChartLineIcon, to: "/vocabulary" },
		{ name: "Chat", icon: UsersIcon, to: "/chat" },
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
								to={module.to}
								className="flex w-full items-center justify-center gap-4 px-6 py-4 font-medium text-2xl"
							>
								<IconComponent className="h-6 w-6" />
								{module.name}
							</LinkButton>
						);
					})}
				</div>
			</main>
		</div>
	);
}
