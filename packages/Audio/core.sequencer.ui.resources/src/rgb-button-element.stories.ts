import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./rgb-button-element.js";

interface ISequencerRgbButtonStoryArgs {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly on: boolean;
  readonly width: number;
  readonly height: number;
}

const meta = {
  title: "Sequencer/RGB Button",
  tags: ["autodocs"],
  render: (args: ISequencerRgbButtonStoryArgs) => html`
    <sequencer-rgb-button
      .r=${args.r}
      .g=${args.g}
      .b=${args.b}
      .on=${args.on}
      .width=${args.width}
      .height=${args.height}
    ></sequencer-rgb-button>
  `,
  args: {
    r: 255,
    g: 64,
    b: 64,
    on: true,
    width: 88,
    height: 88,
  },
  argTypes: {
    r: { control: { type: "number" } },
    g: { control: { type: "number" } },
    b: { control: { type: "number" } },
    on: { control: { type: "boolean" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerRgbButtonStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerRgbButtonStoryArgs>;

export const Default: Story = {};