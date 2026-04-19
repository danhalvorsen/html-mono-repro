import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./triangle-lit.js";

interface IShapeTriangleStoryArgs {
	readonly size: number;
	readonly color: string;
}

const meta = {
	title: "Audio/Shapes/Triangle",
	tags: ["autodocs"],
	render: (args: IShapeTriangleStoryArgs) => html`
		<shape-triangle-lit .size=${args.size} .color=${args.color}></shape-triangle-lit>
	`,
	args: {
		size: 140,
		color: "#22aa44",
	},
	argTypes: {
		size: { control: { type: "number" } },
		color: { control: { type: "color" } },
	},
} satisfies Meta<IShapeTriangleStoryArgs>;

export default meta;

type Story = StoryObj<IShapeTriangleStoryArgs>;

export const Default: Story = {};