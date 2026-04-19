import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./circle-lit.js";

interface IShapeCircleStoryArgs {
	readonly size: number;
	readonly color: string;
}

const meta = {
	title: "Audio/Shapes/Circle",
	tags: ["autodocs"],
	render: (args: IShapeCircleStoryArgs) => html`
		<shape-circle-lit .size=${args.size} .color=${args.color}></shape-circle-lit>
	`,
	args: {
		size: 120,
		color: "#ff4d4d",
	},
	argTypes: {
		size: { control: { type: "number" } },
		color: { control: { type: "color" } },
	},
} satisfies Meta<IShapeCircleStoryArgs>;

export default meta;

type Story = StoryObj<IShapeCircleStoryArgs>;

export const Default: Story = {};