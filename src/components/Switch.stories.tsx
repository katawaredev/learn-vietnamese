import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
	title: "Components/Switch",
	component: Switch,
	argTypes: {
		size: { control: "radio", options: ["small", "medium", "large"] },
		disabled: { control: "boolean" },
	},
	render: (args) => {
		const [checked, setChecked] = useState(args.checked ?? false);
		return <Switch {...args} checked={checked} onCheckedChange={setChecked} />;
	},
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Off: Story = { args: { checked: false } };
export const On: Story = { args: { checked: true } };
export const Small: Story = { args: { size: "small" } };
export const Medium: Story = { args: { size: "medium" } };
export const Large: Story = { args: { size: "large" } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
	args: { disabled: true, checked: true },
};
