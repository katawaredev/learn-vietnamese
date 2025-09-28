import {
	BookOpenIcon,
	ChatBubbleBottomCenterTextIcon,
	ChatBubbleLeftRightIcon,
	DocumentTextIcon,
	HandRaisedIcon,
	NumberedListIcon,
	PencilSquareIcon,
	PuzzlePieceIcon,
	SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { LinkButton } from "~/components/Button";
import { Select } from "~/components/Select";
import Header from "~/layout/Header";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const learningModules = [
		{ name: "Pronunciation", icon: SpeakerWaveIcon, to: "/pronunciation" },
		{ name: "Greetings", icon: HandRaisedIcon, to: "/greetings" },
		{ name: "Numbers", icon: NumberedListIcon, to: "/numbers" },
		{ name: "Grammar", icon: PuzzlePieceIcon, to: "/grammar" },
		{ name: "Phrases", icon: ChatBubbleBottomCenterTextIcon, to: "/phrases" },
		{ name: "Reading", icon: DocumentTextIcon, to: "/reading" },
		{ name: "Dictation", icon: PencilSquareIcon, to: "/dictation" },
		{ name: "Vocabulary", icon: BookOpenIcon, to: "/vocabulary" },
		{ name: "AI Chat", icon: ChatBubbleLeftRightIcon, to: "/chat" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header hideBackButton>
				<Select
					placeholder="Select Category"
					className="min-w-32"
					menuSize="sm"
					options={[
						{ label: "Learn", value: "learn" },
						{ label: "Communication", value: "communication" },
					]}
					onChange={(value) => console.log("Selected:", value)}
				/>
			</Header>

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
				</div>
			</main>
		</div>
	);
}
