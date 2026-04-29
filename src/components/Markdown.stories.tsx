import type { Meta, StoryObj } from "@storybook/react-vite";
import { Markdown } from "./Markdown";

const meta: Meta<typeof Markdown> = {
	title: "Components/Markdown",
	component: Markdown,
	args: {
		text: "Plain text with **bold**, *italic*, and `code` mixed together.",
	},
};

export default meta;
type Story = StoryObj<typeof Markdown>;

export const Default: Story = {};

export const Bold: Story = {
	args: { text: "Like 'k' in **ski** or **kit** — unaspirated." },
};

export const Italic: Story = {
	args: { text: "Found in words like *học* (study) and *trong* (in)." },
};

export const Code: Story = {
	args: { text: "After `-o/-ô/-u` the lips round simultaneously." },
};

export const Mixed: Story = {
	args: {
		text: "**Initial**: postalveolar affricate `/tɕ/`. **Final**: unreleased palatal stop `/k̟̚/` after front vowels (e.g. *sách*).",
	},
};

export const Strikethrough: Story = {
	args: {
		text: "Taller: ~~hơn cao~~ __cao hơn__ (marker goes after the adjective).",
	},
};

export const PlainText: Story = {
	args: {
		text: "No markdown tokens in this string — it should render as-is.",
	},
};
