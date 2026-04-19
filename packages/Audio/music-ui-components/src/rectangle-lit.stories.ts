import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./rectangle-lit.js";

interface IShapeRectangleStoryArgs {
	readonly width: number;
	readonly height: number;
	readonly color: string;
}

const meta = {
	title: "Audio/Shapes/Rectangle",
	tags: ["autodocs"],
	render: (args: IShapeRectangleStoryArgs) => html`
		<shape-rectangle-lit .width=${args.width} .height=${args.height} .color=${args.color}></shape-rectangle-lit>
	`,
	args: {
		width: 180,
		height: 100,
		color: "#0f8b8d",
	},
	argTypes: {
		width: { control: { type: "number" } },
		height: { control: { type: "number" } },
		color: { control: { type: "color" } },
	},
} satisfies Meta<IShapeRectangleStoryArgs>;

export default meta;

type Story = StoryObj<IShapeRectangleStoryArgs>;

export const Default: Story = {};