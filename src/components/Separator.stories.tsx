import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
	title: "Components/Separator",
	component: Separator,
	argTypes: {
		orientation: { control: "radio", options: ["horizontal", "vertical"] },
	},
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
	render: (args) => (
		<div className="w-80 space-y-3">
			<p className="text-warm-cream">Section above</p>
			<Separator {...args} orientation="horizontal" />
			<p className="text-warm-cream">Section below</p>
		</div>
	),
};

export const Vertical: Story = {
	render: (args) => (
		<div className="flex h-20 items-center gap-4">
			<span className="text-warm-cream">Left</span>
			<Separator
				{...args}
				orientation="vertical"
				className="h-full border-t-0 border-l"
			/>
			<span className="text-warm-cream">Right</span>
		</div>
	),
};
