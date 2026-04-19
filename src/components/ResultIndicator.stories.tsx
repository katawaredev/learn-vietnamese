import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResultTextIndicator, ResultVoiceIndicator } from "./ResultIndicator";

const voiceMeta: Meta<typeof ResultVoiceIndicator> = {
	title: "Components/ResultIndicator/Voice",
	component: ResultVoiceIndicator,
	args: {
		expectedText: "Xin chào",
		isNew: false,
	},
	argTypes: {
		isNew: { control: "boolean" },
		hideExpected: { control: "boolean" },
	},
};

export default voiceMeta;
type VoiceStory = StoryObj<typeof ResultVoiceIndicator>;

export const Correct: VoiceStory = {
	args: { transcription: "Xin chào", expectedText: "Xin chào" },
};

export const Incorrect: VoiceStory = {
	args: { transcription: "xin chao ban", expectedText: "Xin chào" },
};

export const Silence: VoiceStory = {
	args: { transcription: null, expectedText: "Xin chào" },
};

export const IncorrectAnimated: VoiceStory = {
	args: {
		transcription: "xin chao ban",
		expectedText: "Xin chào",
		isNew: true,
	},
};

export const TextCorrect: StoryObj<typeof ResultTextIndicator> = {
	render: (args) => <ResultTextIndicator {...args} />,
	args: { inputText: "Xin chào", expectedText: "Xin chào" },
};

export const TextIncorrect: StoryObj<typeof ResultTextIndicator> = {
	render: (args) => <ResultTextIndicator {...args} />,
	args: {
		inputText: "Xin chao",
		expectedText: "Xin chào",
		hint: "Don't forget the diacritics",
	},
};

export const TextIncorrectSmall: StoryObj<typeof ResultTextIndicator> = {
	render: (args) => <ResultTextIndicator {...args} />,
	args: { inputText: "Xin chao", expectedText: "Xin chào", size: "small" },
};
