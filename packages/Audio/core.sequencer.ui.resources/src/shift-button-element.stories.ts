import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./shift-button-element.js";

interface ISequencerShiftButtonStoryArgs {
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

const meta = {
  title: "Sequencer/Shift Button",
  tags: ["autodocs"],
  render: (args: ISequencerShiftButtonStoryArgs) => html`
    <sequencer-shift-button
      .label=${args.label}
      .width=${args.width}
      .height=${args.height}
    ></sequencer-shift-button>
  `,
  args: {
    label: "SHIFT",
    width: 88,
    height: 56,
  },
  argTypes: {
    label: { control: { type: "text" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerShiftButtonStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerShiftButtonStoryArgs>;

export const Default: Story = {};
