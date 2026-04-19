import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListenBaseButton } from "./ListenBaseButton";

const meta: Meta<typeof ListenBaseButton> = {
	title: "Components/ListenBaseButton",
	component: ListenBaseButton,
	args: {
		state: "idle",
		size: "medium",
		onStartRecording: () => {},
		onStopRecording: () => {},
	},
	argTypes: {
		state: { control: "radio", options: ["idle", "recording", "processing"] },
		size: { control: "radio", options: ["small", "medium", "large"] },
		disabled: { control: "boolean" },
		loadingProgress: { control: { type: "range", min: 0, max: 100, step: 5 } },
	},
	parameters: {
		docs: {
			description: {
				component:
					"Presentational base button for listen/record interactions. Used by ListenAIMMSButton and ListenWebButton.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ListenBaseButton>;

export const Idle: Story = { args: { state: "idle" } };
export const Recording: Story = { args: { state: "recording" } };
export const Processing: Story = {
	args: { state: "processing", loadingProgress: 50 },
};
export const ProcessingSpinner: Story = {
	args: { state: "processing", loadingProgress: 0 },
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const Disabled: Story = { args: { disabled: true } };
export const OverflowsTinyContainer: Story = {
	render: () => (
		<div className="flex flex-wrap items-start gap-16">
			{[
				{ state: "idle" as const, loadingProgress: 0 },
				{ state: "recording" as const, loadingProgress: 0 },
				{ state: "processing" as const, loadingProgress: 0 },
				{ state: "processing" as const, loadingProgress: 50 },
			].map(({ state, loadingProgress }, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-order demo grid
					key={i}
					className="flex h-8 w-8 items-center justify-center"
				>
					<ListenBaseButton
						size="medium"
						state={state}
						loadingProgress={loadingProgress}
						onStartRecording={() => {}}
						onStopRecording={() => {}}
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
