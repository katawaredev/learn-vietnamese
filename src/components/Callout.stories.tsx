import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout } from "./Callout";

const meta: Meta<typeof Callout> = {
	title: "Components/Callout",
	component: Callout,
	args: {
		children: "Callout content goes here.",
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["note", "warning", "error"],
		},
		dismissible: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Note: Story = {
	args: { variant: "note" },
};

export const Warning: Story = {
	args: {
		variant: "warning",
		children:
			"Heads up: this content mixes Northern and Southern dialect for pronunciation practice purposes.",
	},
};

export const ErrorVariant: Story = {
	args: {
		variant: "error",
		children: "Audio playback failed. Check your browser permissions.",
	},
};

export const Dismissible: Story = {
	args: {
		variant: "note",
		dismissible: true,
		children:
			"Tip: you can jump to any lesson from the sidebar. Dismiss this once you're comfortable.",
	},
};

export const Multiline: Story = {
	args: {
		variant: "warning",
		dismissible: true,
		children: (
			<>
				<p>
					This page mixes Northern and Southern dialect on purpose — the goal is tonal pronunciation
					practice, not vocabulary acquisition.
				</p>
				<p className="mt-2">
					If you're trying to memorize words from this list, switch to the main Tones lesson
					instead. The icon should stay vertically centered against the full block of text.
				</p>
			</>
		),
	},
};

export const RichContent: Story = {
	args: {
		variant: "note",
		children: (
			<>
				<strong className="text-gold">Note:</strong> The example syllables below are for{" "}
				<em>tonal pronunciation practice</em>, not vocabulary. Some entries are rare or archaic —
				that's intentional.
			</>
		),
	},
};
