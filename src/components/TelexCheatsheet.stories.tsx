import type { Meta, StoryObj } from "@storybook/react-vite";
import { TelexCheatsheet } from "./TelexCheatsheet";

const meta: Meta<typeof TelexCheatsheet> = {
	title: "Components/TelexCheatsheet",
	component: TelexCheatsheet,
};

export default meta;
type Story = StoryObj<typeof TelexCheatsheet>;

export const Default: Story = {};
