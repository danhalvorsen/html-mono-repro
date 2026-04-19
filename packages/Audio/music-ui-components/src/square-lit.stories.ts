import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./square-lit.js";

interface IShapeSquareStoryArgs {
	readonly size: number;
	readonly color: string;
}

const meta = {
	title: "Audio/Shapes/Square",
	tags: ["autodocs"],
	render: (args: IShapeSquareStoryArgs) => html`
		<shape-square-lit .size=${args.size} .color=${args.color}></shape-square-lit>
	`,
	args: {
		size: 120,
		color: "#007acc",
	},
	argTypes: {
		size: { control: { type: "number" } },
		color: { control: { type: "color" } },
	},
} satisfies Meta<IShapeSquareStoryArgs>;

export default meta;

type Story = StoryObj<IShapeSquareStoryArgs>;

export const Default: Story = {};