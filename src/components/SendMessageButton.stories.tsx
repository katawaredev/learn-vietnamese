import type { Meta, StoryObj } from "@storybook/react-vite";
import { SendMessageButton } from "./SendMessageButton";

const meta: Meta<typeof SendMessageButton> = {
	title: "Components/SendMessageButton",
	component: SendMessageButton,
	args: {
		state: "idle",
		size: "medium",
		onSend: () => console.log("send"),
		onStop: () => console.log("stop"),
	},
	argTypes: {
		state: {
			control: "radio",
			options: ["idle", "sending", "loading", "generating"],
		},
		size: { control: "radio", options: ["small", "medium", "large"] },
		disabled: { control: "boolean" },
		loadingProgress: { control: { type: "range", min: 0, max: 100, step: 5 } },
	},
};

export default meta;
type Story = StoryObj<typeof SendMessageButton>;

export const Idle: Story = { args: { state: "idle" } };
export const Sending: Story = { args: { state: "sending" } };
export const Loading: Story = {
	args: { state: "loading", loadingProgress: 50 },
};
export const Generating: Story = { args: { state: "generating" } };
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const Disabled: Story = { args: { disabled: true } };
