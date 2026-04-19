import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select } from "./Select";

const options = [
	{ label: "Option 1", value: "option1" },
	{ label: "Option 2", value: "option2" },
	{ label: "Option 3", value: "option3" },
	{ label: "Disabled Option", value: "option4", disabled: true },
];

const meta: Meta<typeof Select> = {
	title: "Components/Select",
	component: Select,
	args: {
		options,
		placeholder: "Select an option",
	},
	argTypes: {
		size: { control: "radio", options: ["small", "medium", "large"] },
	},
	render: (args) => {
		const [value, setValue] = useState<string | undefined>(args.value);
		return (
			<div className="w-72">
				<Select {...args} value={value} onChange={setValue} />
			</div>
		);
	},
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Small: Story = { args: { size: "small" } };
export const Medium: Story = { args: { size: "medium" } };
export const Large: Story = { args: { size: "large" } };
export const Preselected: Story = {
	args: { size: "medium", value: "option2" },
};
