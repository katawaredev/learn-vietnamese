import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
	title: "Components/Card",
	component: Card,
	args: {
		children: (
			<>
				<h3 className="mb-2 font-serif text-gold text-xl">Card title</h3>
				<p className="text-warm-cream/80">
					Cards group related content with a soft border and translucent
					background. They're used throughout the app for lessons, quizzes, and
					settings panels.
				</p>
			</>
		),
	},
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};

export const AsSection: Story = {
	args: {
		as: "section",
		children: (
			<>
				<h3 className="mb-2 font-serif text-gold text-xl">Section card</h3>
				<p className="text-warm-cream/80">Rendered as a semantic section.</p>
			</>
		),
	},
};

export const WithCustomClassName: Story = {
	args: {
		className: "max-w-md",
		children: (
			<>
				<h3 className="mb-2 font-serif text-gold text-xl">Constrained width</h3>
				<p className="text-warm-cream/80">
					Custom className extends the base card styling.
				</p>
			</>
		),
	},
};
