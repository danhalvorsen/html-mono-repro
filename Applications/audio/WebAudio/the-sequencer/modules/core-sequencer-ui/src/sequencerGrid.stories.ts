import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./sequencerGrid.js";

interface ISequencerGridStoryArgs {
  readonly trackCount: number;
  readonly stepCount: number;
}

const meta = {
  title: "Sequencer/Grid",
  tags: ["autodocs"],
  render: (args: ISequencerGridStoryArgs) => html`
    <sequencer-grid
      .trackCount=${args.trackCount}
      .stepCount=${args.stepCount}
    ></sequencer-grid>
  `,
  args: {
    trackCount: 2,
    stepCount: 16,
  },
  argTypes: {
    trackCount: { control: { type: "number" } },
    stepCount: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerGridStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerGridStoryArgs>;

export const Default: Story = {};

export const FourTracks: Story = {
  args: {
    trackCount: 4,
  },
};
