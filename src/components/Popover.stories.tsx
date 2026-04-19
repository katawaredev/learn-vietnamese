import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info, Settings, Star } from "lucide-react";
import { Popover } from "./Popover";

const meta: Meta<typeof Popover> = {
	title: "Components/Popover",
	component: Popover,
	argTypes: {
		defaultOpen: { control: "boolean" },
		disabled: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Information: Story = {
	args: {
		trigger: <Info className="h-6 w-6" />,
		children: (
			<p className="max-w-xs text-warm-cream">
				Vietnamese is a tonal language with six distinct tones. Mastering tones
				is essential for being understood.
			</p>
		),
	},
};

export const Settings_: Story = {
	name: "Settings",
	args: {
		trigger: <Settings className="h-6 w-6" />,
		children: (
			<div className="max-w-xs space-y-3 text-warm-cream">
				<h4 className="font-serif text-gold text-lg">Practice settings</h4>
				<p className="text-sm">
					Configure how the practice mode behaves. Changes apply immediately and
					persist across sessions.
				</p>
			</div>
		),
	},
};

export const Simple: Story = {
	args: {
		trigger: <Star className="h-6 w-6" />,
		children: <span className="text-warm-cream">A simple popover.</span>,
	},
};

export const DefaultOpen: Story = {
	args: {
		defaultOpen: true,
		trigger: <Info className="h-6 w-6" />,
		children: <p className="text-warm-cream">Opens by default.</p>,
	},
};
