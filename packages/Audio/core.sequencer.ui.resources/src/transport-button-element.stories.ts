import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./transport-button-element.js";

interface ISequencerTransportButtonStoryArgs {
  readonly variant: "play" | "stop" | "record";
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

const meta = {
  title: "Sequencer/Transport Button",
  tags: ["autodocs"],
  render: (args: ISequencerTransportButtonStoryArgs) => html`
    <sequencer-transport-button
      .variant=${args.variant}
      .label=${args.label}
      .width=${args.width}
      .height=${args.height}
    ></sequencer-transport-button>
  `,
  args: {
    variant: "play",
    label: "tap",
    width: 88,
    height: 56,
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["play", "stop", "record"],
    },
    label: { control: { type: "text" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerTransportButtonStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerTransportButtonStoryArgs>;

export const Default: Story = {};