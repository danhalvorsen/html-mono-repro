import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./sequencerControl.js";

interface ISequencerControlStoryArgs {
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly gap: number;
}

const meta = {
  title: "Sequencer/Control",
  tags: ["autodocs"],
  render: (args: ISequencerControlStoryArgs) => html`
    <sequencer-control
      button-width=${String(args.buttonWidth)}
      button-height=${String(args.buttonHeight)}
      gap=${String(args.gap)}
    ></sequencer-control>
  `,
  args: {
    buttonWidth: 88,
    buttonHeight: 56,
    gap: 8,
  },
  argTypes: {
    buttonWidth: { control: { type: "number" } },
    buttonHeight: { control: { type: "number" } },
    gap: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerControlStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerControlStoryArgs>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    buttonWidth: 72,
    buttonHeight: 48,
    gap: 6,
  },
};
