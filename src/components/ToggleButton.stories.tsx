import type { Meta, StoryObj } from "@storybook/react-vite";
import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { ToggleButton } from "./ToggleButton";

const meta: Meta<typeof ToggleButton> = {
	title: "Components/ToggleButton",
	component: ToggleButton,
	args: {
		text: "Toggle",
	},
	argTypes: {
		size: { control: "radio", options: ["small", "medium", "large"] },
	},
	render: (args) => {
		const [checked, setChecked] = useState(args.checked ?? false);
		return (
			<ToggleButton {...args} checked={checked} onCheckedChange={setChecked} />
		);
	},
};

export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const Small: Story = { args: { text: "Small toggle", size: "small" } };
export const Medium: Story = {
	args: { text: "Medium toggle", size: "medium" },
};
export const Large: Story = { args: { text: "Large toggle", size: "large" } };
export const WithIcon: Story = {
	args: {
		text: "Sound Off",
		activeText: "Sound On",
		icon: VolumeX,
		activeIcon: Volume2,
	},
};
export const Checked: Story = { args: { text: "Active", checked: true } };
