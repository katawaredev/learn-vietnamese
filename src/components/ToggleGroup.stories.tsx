import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Italic,
	Underline,
} from "lucide-react";
import { useState } from "react";
import { Toggle, ToggleGroup } from "./ToggleGroup";

const meta: Meta<typeof ToggleGroup> = {
	title: "Components/ToggleGroup",
	component: ToggleGroup,
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const SingleSelectionAlignment: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>(["left"]);
		return (
			<ToggleGroup value={value} onValueChange={setValue}>
				<Toggle value="left">
					<AlignLeft className="h-5 w-5" />
				</Toggle>
				<Toggle value="center">
					<AlignCenter className="h-5 w-5" />
				</Toggle>
				<Toggle value="right">
					<AlignRight className="h-5 w-5" />
				</Toggle>
			</ToggleGroup>
		);
	},
};

export const MultipleSelectionFormatting: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>(["bold"]);
		return (
			<ToggleGroup value={value} onValueChange={setValue} multiple>
				<Toggle value="bold">
					<Bold className="h-5 w-5" />
				</Toggle>
				<Toggle value="italic">
					<Italic className="h-5 w-5" />
				</Toggle>
				<Toggle value="underline">
					<Underline className="h-5 w-5" />
				</Toggle>
			</ToggleGroup>
		);
	},
};

export const SmallText: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>(["one"]);
		return (
			<ToggleGroup value={value} onValueChange={setValue}>
				<Toggle value="one" size="small">
					One
				</Toggle>
				<Toggle value="two" size="small">
					Two
				</Toggle>
				<Toggle value="three" size="small">
					Three
				</Toggle>
			</ToggleGroup>
		);
	},
};

export const MediumText: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>(["one"]);
		return (
			<ToggleGroup value={value} onValueChange={setValue}>
				<Toggle value="one" size="medium">
					One
				</Toggle>
				<Toggle value="two" size="medium">
					Two
				</Toggle>
				<Toggle value="three" size="medium">
					Three
				</Toggle>
			</ToggleGroup>
		);
	},
};

export const LargeText: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>(["one"]);
		return (
			<ToggleGroup value={value} onValueChange={setValue}>
				<Toggle value="one" size="large">
					One
				</Toggle>
				<Toggle value="two" size="large">
					Two
				</Toggle>
				<Toggle value="three" size="large">
					Three
				</Toggle>
			</ToggleGroup>
		);
	},
};

export const VerticalOrientation: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>(["top"]);
		return (
			<ToggleGroup
				value={value}
				onValueChange={setValue}
				orientation="vertical"
			>
				<Toggle value="top" orientation="vertical">
					Top
				</Toggle>
				<Toggle value="middle" orientation="vertical">
					Middle
				</Toggle>
				<Toggle value="bottom" orientation="vertical">
					Bottom
				</Toggle>
			</ToggleGroup>
		);
	},
};
