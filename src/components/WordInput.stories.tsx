import type { Meta, StoryObj } from "@storybook/react-vite";
import { WordInput } from "./WordInput";

const meta: Meta<typeof WordInput> = {
	title: "Components/WordInput",
	component: WordInput,
	args: {
		onChange: (text) => console.log("WordInput:", text),
	},
};

export default meta;
type Story = StoryObj<typeof WordInput>;

export const SingleWordWithHint: Story = {
	args: { text: "Xin", hint: "X  " },
};

export const MultiWordWithHints: Story = {
	args: { text: "Chào buổi sáng", hint: "C       ổ     " },
};

export const WithoutHints: Story = {
	args: { text: "Cảm ơn bạn" },
};

export const LongPhrase: Story = {
	args: { text: "Tôi học tiếng Việt" },
};
