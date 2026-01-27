import { createFileRoute } from "@tanstack/react-router";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Info,
	Italic,
	Play,
	Settings,
	Star,
	Underline,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button";
import { Disclosure } from "~/components/Disclosure";
import { ListenButton } from "~/components/ListenButton";
import { Popover } from "~/components/Popover";
import { Select } from "~/components/Select";
import { SpeakButton } from "~/components/SpeakButton";
import { ToggleButton } from "~/components/ToggleButton";
import { Toggle, ToggleGroup } from "~/components/ToggleGroup";
import { WordInputMultiple } from "~/components/WordInputMultiple";
import { WordInputSingle } from "~/components/WordInputSingle";

export const Route = createFileRoute("/showcase")({
	component: ShowcasePage,
});

function ShowcasePage() {
	const [selectValue, setSelectValue] = useState("option1");
	const [toggleChecked, setToggleChecked] = useState(false);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [alignment, setAlignment] = useState<string[]>(["left"]);
	const [formatting, setFormatting] = useState<string[]>([]);
	const [transcriptionVN, setTranscriptionVN] = useState("");
	const [transcriptionEN, setTranscriptionEN] = useState("");
	const [spokenTextVN, setSpokenTextVN] = useState("Xin chào");
	const [spokenTextEN, setSpokenTextEN] = useState("Hello");
	const [_singleInput, setSingleInput] = useState("");
	const [_multipleInput, setMultipleInput] = useState("");

	const selectOptions = [
		{ label: "Option 1", value: "option1" },
		{ label: "Option 2", value: "option2" },
		{ label: "Option 3", value: "option3" },
		{ label: "Disabled Option", value: "option4", disabled: true },
	];

	return (
		<div className="min-h-screen bg-burgundy-dark p-8">
			<div className="mx-auto max-w-4xl space-y-12">
				<header className="text-center">
					<h1 className="mb-4 font-serif text-5xl text-gold">
						Component Showcase
					</h1>
					<p className="text-warm-cream/70">
						All Base UI components and their variants
					</p>
				</header>

				{/* Button Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Buttons</h2>

					<div className="space-y-4">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Default Variant</h3>
							<div className="flex flex-wrap items-start gap-4">
								<Button variant="default" size="small">
									Small Button
								</Button>
								<Button variant="default" size="medium">
									Medium Button
								</Button>
								<Button variant="default" size="large">
									Large Button
								</Button>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Outline Variant</h3>
							<div className="flex flex-wrap items-start gap-4">
								<Button variant="outline" size="small">
									Small Outline
								</Button>
								<Button variant="outline" size="medium">
									Medium Outline
								</Button>
								<Button variant="outline" size="large">
									Large Outline
								</Button>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Ghost Variant</h3>
							<div className="flex flex-wrap items-start gap-4">
								<Button variant="ghost" size="small">
									Small Ghost
								</Button>
								<Button variant="ghost" size="medium">
									Medium Ghost
								</Button>
								<Button variant="ghost" size="large">
									Large Ghost
								</Button>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Link Buttons</h3>
							<div className="flex flex-wrap items-start gap-4">
								<LinkButton to="/" variant="default" size="medium">
									Link to Home
								</LinkButton>
								<LinkButton to="/" variant="outline" size="medium">
									Outline Link
								</LinkButton>
								<LinkButton to="/" variant="ghost" size="medium">
									Ghost Link
								</LinkButton>
							</div>
						</div>
					</div>
				</section>

				{/* Popover Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Popover</h2>

					<div className="flex flex-wrap gap-4">
						<Popover trigger={<Info className="h-6 w-6" />}>
							<div className="space-y-2">
								<h3 className="font-serif text-gold text-lg">
									Information Popover
								</h3>
								<p className="text-warm-cream">
									This is a popover with content.
								</p>
							</div>
						</Popover>

						<Popover trigger={<Settings className="h-6 w-6" />}>
							<div className="space-y-2">
								<h3 className="font-serif text-gold text-lg">Settings</h3>
								<p className="text-warm-cream">
									This popover has more space for content and can accommodate
									larger elements.
								</p>
							</div>
						</Popover>

						<Popover trigger={<Star className="h-6 w-6" />}>
							<div className="text-warm-cream">Simple popover content</div>
						</Popover>
					</div>
				</section>

				{/* Select Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Select</h2>

					<div className="space-y-4">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Small Size</h3>
							<Select
								options={selectOptions}
								value={selectValue}
								onChange={setSelectValue}
								placeholder="Select an option"
								size="small"
							/>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Medium Size</h3>
							<Select
								options={selectOptions}
								value={selectValue}
								onChange={setSelectValue}
								placeholder="Select an option"
								size="medium"
							/>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Large Size</h3>
							<Select
								options={selectOptions}
								value={selectValue}
								onChange={setSelectValue}
								placeholder="Select an option"
								size="large"
							/>
						</div>
					</div>
				</section>

				{/* Disclosure Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Disclosure</h2>

					<div className="space-y-4">
						<Disclosure
							title={
								<span className="font-serif text-gold text-xl">
									What is Vietnamese?
								</span>
							}
						>
							<p className="text-warm-cream">
								Vietnamese is the official language of Vietnam, spoken by over
								95 million people worldwide. It is a tonal language with six
								distinct tones that can change the meaning of words.
							</p>
						</Disclosure>

						<Disclosure
							title={
								<span className="font-serif text-gold text-xl">
									How do tones work?
								</span>
							}
							defaultOpen
						>
							<p className="text-warm-cream">
								Vietnamese has six tones: level (ngang), rising (sắc), falling
								(huyền), question (hỏi), tumbling (ngã), and heavy (nặng). Each
								tone changes the pitch pattern of a syllable, creating different
								meanings for otherwise identical syllables.
							</p>
						</Disclosure>

						<Disclosure
							title={
								<span className="font-serif text-gold text-xl">
									Practice Tips
								</span>
							}
						>
							<ul className="list-inside list-disc space-y-2 text-warm-cream">
								<li>Listen to native speakers regularly</li>
								<li>Practice tones with minimal pairs</li>
								<li>Record yourself and compare with native pronunciation</li>
								<li>Focus on one tone at a time</li>
								<li>Use the interactive exercises in this app</li>
							</ul>
						</Disclosure>
					</div>
				</section>

				{/* Toggle Button Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Toggle Buttons</h2>

					<div className="space-y-4">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Basic Toggle</h3>
							<div className="flex flex-wrap items-start gap-4">
								<ToggleButton
									text="Toggle Me"
									checked={toggleChecked}
									onCheckedChange={setToggleChecked}
									size="small"
								/>
								<ToggleButton
									text="Toggle Me"
									checked={toggleChecked}
									onCheckedChange={setToggleChecked}
									size="medium"
								/>
								<ToggleButton
									text="Toggle Me"
									checked={toggleChecked}
									onCheckedChange={setToggleChecked}
									size="large"
								/>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">With Icons</h3>
							<div className="flex flex-wrap gap-4">
								<ToggleButton
									text="Sound Off"
									activeText="Sound On"
									icon={VolumeX}
									activeIcon={Volume2}
									checked={soundEnabled}
									onCheckedChange={setSoundEnabled}
									size="medium"
								/>
								<ToggleButton
									text="Start"
									activeText="Playing"
									icon={Play}
									activeIcon={Play}
									checked={toggleChecked}
									onCheckedChange={setToggleChecked}
									size="medium"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Toggle Group Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Toggle Groups</h2>

					<div className="space-y-4">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Single Selection (Alignment)
							</h3>
							<ToggleGroup
								value={alignment}
								onValueChange={(value: string[]) => setAlignment(value)}
							>
								<Toggle value="left" size="medium" orientation="horizontal">
									<AlignLeft className="h-5 w-5" />
								</Toggle>
								<Toggle value="center" size="medium" orientation="horizontal">
									<AlignCenter className="h-5 w-5" />
								</Toggle>
								<Toggle value="right" size="medium" orientation="horizontal">
									<AlignRight className="h-5 w-5" />
								</Toggle>
							</ToggleGroup>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Multiple Selection (Text Formatting)
							</h3>
							<ToggleGroup
								multiple
								value={formatting}
								onValueChange={(value: string[]) => setFormatting(value)}
							>
								<Toggle value="bold" size="medium" orientation="horizontal">
									<Bold className="h-5 w-5" />
								</Toggle>
								<Toggle value="italic" size="medium" orientation="horizontal">
									<Italic className="h-5 w-5" />
								</Toggle>
								<Toggle
									value="underline"
									size="medium"
									orientation="horizontal"
								>
									<Underline className="h-5 w-5" />
								</Toggle>
							</ToggleGroup>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Different Sizes with Text
							</h3>
							<div className="flex flex-wrap items-start gap-4">
								<ToggleGroup
									value={alignment}
									onValueChange={(value: string[]) => setAlignment(value)}
								>
									<Toggle value="left" size="small" orientation="horizontal">
										Left
									</Toggle>
									<Toggle value="center" size="small" orientation="horizontal">
										Center
									</Toggle>
									<Toggle value="right" size="small" orientation="horizontal">
										Right
									</Toggle>
								</ToggleGroup>

								<ToggleGroup
									value={alignment}
									onValueChange={(value: string[]) => setAlignment(value)}
								>
									<Toggle value="left" size="medium" orientation="horizontal">
										Left
									</Toggle>
									<Toggle value="center" size="medium" orientation="horizontal">
										Center
									</Toggle>
									<Toggle value="right" size="medium" orientation="horizontal">
										Right
									</Toggle>
								</ToggleGroup>

								<ToggleGroup
									value={alignment}
									onValueChange={(value: string[]) => setAlignment(value)}
								>
									<Toggle value="left" size="large" orientation="horizontal">
										Left
									</Toggle>
									<Toggle value="center" size="large" orientation="horizontal">
										Center
									</Toggle>
									<Toggle value="right" size="large" orientation="horizontal">
										Right
									</Toggle>
								</ToggleGroup>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Vertical Orientation
							</h3>
							<ToggleGroup
								orientation="vertical"
								value={alignment}
								onValueChange={(value: string[]) => setAlignment(value)}
							>
								<Toggle value="left" size="medium" orientation="vertical">
									<AlignLeft className="h-5 w-5" />
									<span>Left</span>
								</Toggle>
								<Toggle value="center" size="medium" orientation="vertical">
									<AlignCenter className="h-5 w-5" />
									<span>Center</span>
								</Toggle>
								<Toggle value="right" size="medium" orientation="vertical">
									<AlignRight className="h-5 w-5" />
									<span>Right</span>
								</Toggle>
							</ToggleGroup>
						</div>
					</div>
				</section>

				{/* Listen Button Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Listen Button</h2>

					<div className="space-y-6">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Speech to Text (Vietnamese)
							</h3>
							<div className="flex flex-wrap items-center gap-8">
								<ListenButton
									onTranscription={setTranscriptionVN}
									lang="vn"
									size="small"
								/>
								<ListenButton
									onTranscription={setTranscriptionVN}
									lang="vn"
									size="medium"
								/>
								<ListenButton
									onTranscription={setTranscriptionVN}
									lang="vn"
									size="large"
								/>
							</div>
							<p className="mt-4 min-h-6 text-warm-cream">
								{transcriptionVN && (
									<>
										Transcription:{" "}
										<span className="text-gold">{transcriptionVN}</span>
									</>
								)}
							</p>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Speech to Text (English)
							</h3>
							<div className="flex flex-wrap items-center gap-8">
								<ListenButton
									onTranscription={setTranscriptionEN}
									lang="en"
									size="small"
								/>
								<ListenButton
									onTranscription={setTranscriptionEN}
									lang="en"
									size="medium"
								/>
								<ListenButton
									onTranscription={setTranscriptionEN}
									lang="en"
									size="large"
								/>
							</div>
							<p className="mt-4 min-h-6 text-warm-cream">
								{transcriptionEN && (
									<>
										Transcription:{" "}
										<span className="text-gold">{transcriptionEN}</span>
									</>
								)}
							</p>
						</div>
					</div>
				</section>

				{/* Speak Button Component */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Speak Button</h2>

					<div className="space-y-6">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Text to Speech (Vietnamese)
							</h3>
							<div className="flex flex-wrap items-center gap-8">
								<SpeakButton text={spokenTextVN} lang="vn" size="small" />
								<SpeakButton text={spokenTextVN} lang="vn" size="medium" />
								<SpeakButton text={spokenTextVN} lang="vn" size="large" />
							</div>
							<div className="mt-4 flex items-center gap-2">
								<span className="text-warm-cream">Speaking:</span>
								<input
									type="text"
									value={spokenTextVN}
									onChange={(e) => setSpokenTextVN(e.target.value)}
									className="flex-1 rounded border border-gold/30 bg-burgundy-medium px-4 py-2 text-warm-cream outline-none focus:border-gold"
									placeholder="Enter Vietnamese text to speak..."
								/>
							</div>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Text to Speech (English)
							</h3>
							<div className="flex flex-wrap items-center gap-8">
								<SpeakButton text={spokenTextEN} lang="en" size="small" />
								<SpeakButton text={spokenTextEN} lang="en" size="medium" />
								<SpeakButton text={spokenTextEN} lang="en" size="large" />
							</div>
							<div className="mt-4 flex items-center gap-2">
								<span className="text-warm-cream">Speaking:</span>
								<input
									type="text"
									value={spokenTextEN}
									onChange={(e) => setSpokenTextEN(e.target.value)}
									className="flex-1 rounded border border-gold/30 bg-burgundy-medium px-4 py-2 text-warm-cream outline-none focus:border-gold"
									placeholder="Enter English text to speak..."
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Word Input Components */}
				<section className="space-y-6">
					<h2 className="font-serif text-3xl text-gold">Word Inputs</h2>

					<div className="space-y-8">
						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Single Word Input
							</h3>
							<WordInputSingle
								text="Xin chào"
								hint="X       "
								onChange={(text) => {
									setSingleInput(text);
									console.log("Single input:", text);
								}}
							/>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">
								Multiple Word Input
							</h3>
							<WordInputMultiple
								text="Chào buổi sáng"
								hint="C       ổ     "
								onChange={(text) => {
									setMultipleInput(text);
									console.log("Multiple input:", text);
								}}
							/>
						</div>

						<div>
							<h3 className="mb-3 text-lg text-warm-cream">Without Hints</h3>
							<WordInputMultiple
								text="Cảm ơn bạn"
								onChange={(text) => console.log("No hints input:", text)}
							/>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
