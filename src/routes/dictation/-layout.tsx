import { useNavigate } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { Popover } from "~/components/Popover";
import { A1 } from "~/data/dictation";
import Header from "~/layout/Header";

export interface DictationEntry {
	slug: string;
	title: {
		en: string;
		vn: string;
	};
	story: Array<{
		en: string;
		vn: string;
		notes?: string;
	}>;
}

export interface DictationSentence {
	en: string;
	vn: string;
	notes?: string;
}

export function validateSlug(slug: string): boolean {
	const allEntries = { ...A1 };
	return !!allEntries[slug];
}

export function getEntry(slug: string): DictationEntry | null {
	const entry = A1[slug];
	return entry ? (entry as DictationEntry) : null;
}

interface DictationLayoutProps {
	entry: DictationEntry;
	currentIndex: number;
	onIndexChange: (index: number) => void;
	practiceContent: ReactNode;
	translationContent: ReactNode;
	inputContent: ReactNode;
	navigationMiddle?: ReactNode;
}

export function DictationLayout({
	entry,
	currentIndex,
	onIndexChange,
	practiceContent,
	translationContent,
	inputContent,
	navigationMiddle,
}: DictationLayoutProps) {
	const navigate = useNavigate();
	const currentSentence = entry.story[currentIndex];
	const isLastSentence = currentIndex === entry.story.length - 1;
	const progress = `${currentIndex + 1} / ${entry.story.length}`;

	const handleNext = () => {
		if (isLastSentence) {
			navigate({ to: "/dictation" });
		} else {
			onIndexChange(currentIndex + 1);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-burgundy-dark to-burgundy">
			<Header>
				<div className="text-center">
					<h1 className="font-bold font-serif text-warm-cream text-xl">
						{entry.title.vn}
					</h1>
					<p className="text-gold/80 text-xs">{progress}</p>
				</div>
			</Header>
			<main className="flex flex-1 flex-col px-4 pb-8">
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
					{/* Practice Area */}
					<div className="flex flex-1 items-center justify-center">
						<div
							key={currentIndex}
							className="fade-in slide-in-from-right-96 flex animate-in flex-col items-center space-y-20 duration-500"
						>
							<div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
								{practiceContent}
								<div className="flex items-center gap-2">
									{translationContent}
									{currentSentence.notes && (
										<Popover
											trigger={<Info className="h-5 w-5 text-gold" />}
											buttonClassName="opacity-60 hover:opacity-100 transition-opacity p-1"
										>
											<div className="text-sm">{currentSentence.notes}</div>
										</Popover>
									)}
								</div>
							</div>
							<div className="flex flex-col items-center space-y-4">
								{inputContent}
							</div>
						</div>
					</div>

					{/* Navigation */}
					<div className="mx-auto w-full max-w-4xl pt-12">
						<div className="grid grid-cols-[1fr_6rem_1fr] gap-4">
							<LinkButton variant="outline" size="medium" to="/dictation">
								← Stories
							</LinkButton>
							{navigationMiddle || <div />}
							<Button variant="outline" size="medium" onClick={handleNext}>
								{isLastSentence ? "Complete" : "Next →"}
							</Button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

interface UseDictationPracticeProps {
	slug: string;
}

export function useDictationPractice({ slug }: UseDictationPracticeProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const entry = getEntry(slug);

	if (!entry) {
		return null;
	}

	const currentSentence = entry.story[currentIndex];

	return {
		entry,
		currentIndex,
		currentSentence,
		setCurrentIndex,
	};
}
