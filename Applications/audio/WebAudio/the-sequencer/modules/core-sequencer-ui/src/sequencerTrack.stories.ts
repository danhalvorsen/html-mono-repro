import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./sequencerTrack.js";

interface ISequencerTrackStoryArgs {
  readonly stepCount: number;
}

const meta = {
  title: "Sequencer/Track",
  tags: ["autodocs"],
  render: (args: ISequencerTrackStoryArgs) => html`
    <sequencer-track .stepCount=${args.stepCount}></sequencer-track>
  `,
  args: {
    stepCount: 16,
  },
  argTypes: {
    stepCount: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerTrackStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerTrackStoryArgs>;

export const Default: Story = {};

export const ThirtyTwoSteps: Story = {
  args: {
    stepCount: 32,
  },
};
