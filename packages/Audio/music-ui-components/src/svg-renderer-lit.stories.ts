import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./svg-renderer-lit.js";

interface ISvgRendererStoryArgs {
	readonly svg: string;
}

const meta = {
	title: "Audio/SVG Renderer",
	tags: ["autodocs"],
	render: (args: ISvgRendererStoryArgs) => html`
		<svg-renderer-lit .svg=${args.svg}></svg-renderer-lit>
	`,
	args: {
		svg: `<svg viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg"><circle cx="80" cy="80" r="64" fill="#1e90ff"></circle></svg>`,
	},
	argTypes: {
		svg: { control: { type: "text" } },
	},
} satisfies Meta<ISvgRendererStoryArgs>;

export default meta;

type Story = StoryObj<ISvgRendererStoryArgs>;

export const Default: Story = {};