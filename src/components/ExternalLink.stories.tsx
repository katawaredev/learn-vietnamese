import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExternalLink } from "./ExternalLink";

const meta: Meta<typeof ExternalLink> = {
	title: "Components/ExternalLink",
	component: ExternalLink,
	args: {
		text: "Visit example",
		href: "https://example.com",
	},
};

export default meta;
type Story = StoryObj<typeof ExternalLink>;

export const Default: Story = {};

export const Wikipedia: Story = {
	args: {
		text: "Vietnamese language on Wikipedia",
		href: "https://en.wikipedia.org/wiki/Vietnamese_language",
	},
};

export const WithCustomClassName: Story = {
	args: {
		text: "Styled link",
		href: "https://example.com",
		className: "text-gold",
	},
};
