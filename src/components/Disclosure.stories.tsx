import type { Meta, StoryObj } from "@storybook/react-vite";
import { Disclosure } from "./Disclosure";

const meta: Meta<typeof Disclosure> = {
	title: "Components/Disclosure",
	component: Disclosure,
	args: {
		title: "Bài học 1: Chào hỏi",
		children: (
			<p className="text-warm-cream/80">
				Học cách chào hỏi cơ bản trong tiếng Việt. Bao gồm các cụm từ phổ biến
				như "Xin chào", "Cảm ơn", và "Tạm biệt".
			</p>
		),
	},
	argTypes: {
		defaultOpen: { control: "boolean" },
		plain: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Disclosure>;

export const Default: Story = {};

export const DefaultOpen: Story = {
	args: { defaultOpen: true },
};

export const Plain: Story = {
	args: { plain: true, defaultOpen: true },
};

export const WithList: Story = {
	args: {
		title: "Từ vựng",
		defaultOpen: true,
		children: (
			<ul className="list-inside list-disc space-y-1 text-warm-cream/80">
				<li>Xin chào — Hello</li>
				<li>Cảm ơn — Thank you</li>
				<li>Tạm biệt — Goodbye</li>
				<li>Xin lỗi — Sorry</li>
			</ul>
		),
	},
};
