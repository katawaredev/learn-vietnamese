import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpeakBaseButton } from "./SpeakBaseButton";

const neverResolvingAudio = () => new Promise<HTMLAudioElement>(() => {});

const meta: Meta<typeof SpeakBaseButton> = {
	title: "Components/SpeakBaseButton",
	component: SpeakBaseButton,
	args: {
		size: "medium",
		isGenerating: false,
		loadingProgress: 0,
		getAudio: neverResolvingAudio,
		canPlay: () => true,
	},
	argTypes: {
		size: { control: "radio", options: ["small", "medium", "large"] },
		isGenerating: { control: "boolean" },
		disabled: { control: "boolean" },
		loadingProgress: { control: { type: "range", min: 0, max: 100, step: 5 } },
	},
	parameters: {
		docs: {
			description: {
				component:
					"Presentational base button for speak/play interactions. The audio promise never resolves in stories so clicking won't actually play anything.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof SpeakBaseButton>;

export const Idle: Story = {};
export const Generating: Story = {
	args: { isGenerating: true, loadingProgress: 50 },
};
export const GeneratingSpinner: Story = {
	args: { isGenerating: true, loadingProgress: 0 },
};
export const CannotPlay: Story = {
	args: { canPlay: () => false },
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const Disabled: Story = { args: { disabled: true } };
export const OverflowsTinyContainer: Story = {
	render: () => (
		<div className="flex flex-wrap items-start gap-16">
			{[
				{ isGenerating: false, loadingProgress: 0, canPlay: () => true },
				{ isGenerating: true, loadingProgress: 0, canPlay: () => true },
				{ isGenerating: true, loadingProgress: 50, canPlay: () => true },
				{ isGenerating: false, loadingProgress: 0, canPlay: () => false },
			].map(({ isGenerating, loadingProgress, canPlay }, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-order demo grid
					key={i}
					className="flex h-8 w-8 items-center justify-center"
				>
					<SpeakBaseButton
						size="medium"
						isGenerating={isGenerating}
						loadingProgress={loadingProgress}
						getAudio={neverResolvingAudio}
						canPlay={canPlay}
					/>
				</div>
			))}
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Each button is placed in a square smaller than itself so it overflows the container. Verifies the circular indicator stays a perfect circle and is not clipped to the parent's box.",
			},
		},
	},
};
