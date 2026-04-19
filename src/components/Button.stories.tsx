import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, LinkButton } from "./Button";

const meta: Meta<typeof Button> = {
	title: "Components/Button",
	component: Button,
	args: { children: "Button" },
	argTypes: {
		variant: { control: "radio", options: ["default", "outline", "ghost"] },
		size: { control: "radio", options: ["small", "medium", "large"] },
		disabled: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { variant: "default", size: "medium" } };
export const Outline: Story = { args: { variant: "outline", size: "medium" } };
export const Ghost: Story = { args: { variant: "ghost", size: "medium" } };
export const Small: Story = { args: { size: "small" } };
export const Medium: Story = { args: { size: "medium" } };
export const Large: Story = { args: { size: "large" } };
export const Disabled: Story = { args: { disabled: true } };

export const AsLink: StoryObj<typeof LinkButton> = {
	render: (args) => <LinkButton {...args}>Link to Home</LinkButton>,
	args: { to: "/", variant: "default", size: "medium" },
};

export const LinkOutline: StoryObj<typeof LinkButton> = {
	render: (args) => <LinkButton {...args}>Outline Link</LinkButton>,
	args: { to: "/", variant: "outline", size: "medium" },
};

export const LinkGhost: StoryObj<typeof LinkButton> = {
	render: (args) => <LinkButton {...args}>Ghost Link</LinkButton>,
	args: { to: "/", variant: "ghost", size: "medium" },
};
