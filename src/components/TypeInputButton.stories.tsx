import type { Meta, StoryObj } from "@storybook/react-vite";
import { TypeInputButton } from "./TypeInputButton";

const meta: Meta<typeof TypeInputButton> = {
	title: "Components/TypeInputButton",
	component: TypeInputButton,
	args: {
		size: "medium",
		placeholder: "Type your answer...",
		onSubmit: (text) => console.log("submitted:", text),
	},
	argTypes: {
		size: { control: "radio", options: ["small", "medium", "large"] },
		disabled: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof TypeInputButton>;

export const Default: Story = {};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
export const Disabled: Story = { args: { disabled: true } };
export const VietnamesePlaceholder: Story = {
	args: { placeholder: "Nhập câu trả lời..." },
};
