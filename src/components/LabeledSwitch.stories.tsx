import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LabeledSwitch } from "./LabeledSwitch";

const meta: Meta<typeof LabeledSwitch> = {
	title: "Components/LabeledSwitch",
	component: LabeledSwitch,
	args: {
		label: "Show hints",
		description: "Display character hints while typing",
	},
	argTypes: {
		size: { control: "radio", options: ["small", "medium", "large"] },
		disabled: { control: "boolean" },
	},
	render: (args) => {
		const [checked, setChecked] = useState(args.checked ?? false);
		return (
			<div className="max-w-md">
				<LabeledSwitch
					{...args}
					checked={checked}
					onCheckedChange={setChecked}
				/>
			</div>
		);
	},
};

export default meta;
type Story = StoryObj<typeof LabeledSwitch>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const NoDescription: Story = {
	args: { label: "Sound effects", description: undefined },
};

export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
