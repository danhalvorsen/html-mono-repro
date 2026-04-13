import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./tone-label-element.js";

interface ISvgLabelStoryArgs {
  readonly label: string;
  readonly tone: string;
  readonly state: "active" | "inactive";
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly fillColor: string;
  readonly fillOpacity: number;
  readonly textColor: string;
  readonly margin: number;
}

const meta = {
  title: "Sequencer/SVG Label",
  tags: ["autodocs"],
  render: (args: ISvgLabelStoryArgs) => html`
    <svg-label
      .label=${args.label}
      .tone=${args.tone}
      .state=${args.state}
      .buttonWidth=${args.buttonWidth}
      .buttonHeight=${args.buttonHeight}
      .fillColor=${args.fillColor}
      .fillOpacity=${args.fillOpacity}
      .textColor=${args.textColor}
      .margin=${args.margin}
    ></svg-label>
  `,
  args: {
    label: "FILTER",
    tone: "C",
    state: "active",
    buttonWidth: 88,
    buttonHeight: 88,
    fillColor: "#121826",
    fillOpacity: 1,
    textColor: "#f3f4f6",
    margin: 8,
  },
  argTypes: {
    label: { control: { type: "text" } },
    tone: { control: { type: "text" } },
    state: { control: { type: "select" }, options: ["active", "inactive"] },
    buttonWidth: { control: { type: "number" } },
    buttonHeight: { control: { type: "number" } },
    fillColor: { control: { type: "color" } },
    fillOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    textColor: { control: { type: "color" } },
    margin: { control: { type: "range", min: 0, max: 30, step: 1 } },
  },
} satisfies Meta<ISvgLabelStoryArgs>;

export default meta;

type Story = StoryObj<ISvgLabelStoryArgs>;

export const Default: Story = {};

export const ToneFallback: Story = {
  args: {
    label: "",
    tone: "F#",
  },
};

export const Inactive: Story = {
  args: {
    state: "inactive",
    fillColor: "",
    textColor: "",
    fillOpacity: 1,
  },
};
