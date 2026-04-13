import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./digit-button-element.js";

interface ISequencerDigitButtonStoryArgs {
  readonly digit: number;
  readonly selected: boolean;
  readonly width: number;
  readonly height: number;
  readonly labelPrefix: string;
}

const meta = {
  title: "Sequencer/Digit Button",
  tags: ["autodocs"],
  render: (args: ISequencerDigitButtonStoryArgs) => html`
    <sequencer-digit-button
      .digit=${args.digit}
      .selected=${args.selected}
      .width=${args.width}
      .height=${args.height}
      .labelPrefix=${args.labelPrefix}
    ></sequencer-digit-button>
  `,
  args: {
    digit: 3,
    selected: true,
    width: 88,
    height: 88,
    labelPrefix: "Digit",
  },
  argTypes: {
    digit: { control: { type: "number" } },
    selected: { control: { type: "boolean" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
    labelPrefix: { control: { type: "text" } },
  },
} satisfies Meta<ISequencerDigitButtonStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerDigitButtonStoryArgs>;

export const Default: Story = {};

export const AlternatingDigits: Story = {
  render: (args: ISequencerDigitButtonStoryArgs) => html`
    <div
      style="
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: min-content;
        gap: 8px;
        align-items: center;
      "
    >
      ${Array.from({ length: 10 }, (_, digit) => html`
        <sequencer-digit-button
          .digit=${digit}
          .selected=${digit % 2 === 0}
          .width=${args.width}
          .height=${args.height}
          .labelPrefix=${args.labelPrefix}
        ></sequencer-digit-button>
      `)}
    </div>
  `,
  args: {
    width: 88,
    height: 88,
    labelPrefix: "Digit",
  },
};
