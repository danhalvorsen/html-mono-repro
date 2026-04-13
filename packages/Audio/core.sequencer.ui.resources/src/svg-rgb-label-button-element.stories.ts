import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./svg-rgb-label-button-element.js";

interface ISvgRgbLabelButtonStoryArgs {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly on: boolean;
  readonly label: string;
  readonly fillColor: string;
  readonly opacity: number;
  readonly textColor: string;
  readonly margin: number;
  readonly width: number;
  readonly height: number;
  readonly labelPlacement: "top" | "bottom" | "left" | "right" | "center";
  readonly labelAlignment: "start" | "center" | "end";
  readonly labelAttachment: "inside" | "outside" | "overlay";
  readonly labelGap: number;
  readonly labelSpan: number;
}

const meta = {
  title: "Sequencer/RGB Label Button",
  tags: ["autodocs"],
  render: (args: ISvgRgbLabelButtonStoryArgs) => html`
    <svg-rgb-label-button
      .r=${args.r}
      .g=${args.g}
      .b=${args.b}
      .on=${args.on}
      .label=${args.label}
      .fillColor=${args.fillColor}
      .opacity=${args.opacity}
      .textColor=${args.textColor}
      .margin=${args.margin}
      .width=${args.width}
      .height=${args.height}
      .labelPlacement=${args.labelPlacement}
      .labelAlignment=${args.labelAlignment}
      .labelAttachment=${args.labelAttachment}
      .labelGap=${args.labelGap}
      .labelSpan=${args.labelSpan}
    ></svg-rgb-label-button>
  `,
  args: {
    r: 255,
    g: 64,
    b: 64,
    on: true,
    label: "C",
    fillColor: "#121826",
    opacity: 1,
    textColor: "#f3f4f6",
    margin: 8,
    width: 88,
    height: 88,
    labelPlacement: "bottom",
    labelAlignment: "center",
    labelAttachment: "inside",
    labelGap: 0,
    labelSpan: 1,
  },
  argTypes: {
    r: { control: { type: "number" } },
    g: { control: { type: "number" } },
    b: { control: { type: "number" } },
    on: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
    fillColor: {
      control: { type: "color" },
      description: "Fill color of the SVG label field.",
      table: { category: "Label Style" },
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
      description: "Transparency of the SVG label field fill.",
      table: { category: "Label Style" },
    },
    textColor: {
      control: { type: "color" },
      description: "Text color of the SVG label.",
      table: { category: "Label Style" },
    },
    margin: {
      control: { type: "range", min: 0, max: 30, step: 1 },
      description: "Clearance between the host button edge and the label rectangle.",
      table: { category: "Label Style" },
    },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
    labelPlacement: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right", "center"],
      description: "Semantic placement of the label relative to the button.",
      table: { category: "Semantic Model" },
    },
    labelAlignment: {
      control: { type: "select" },
      options: ["start", "center", "end"],
      description: "Alignment along the placement axis.",
      table: { category: "Semantic Model" },
    },
    labelAttachment: {
      control: { type: "select" },
      options: ["inside", "outside", "overlay"],
      description: "Whether the label sits inside, outside, or overlays the button edge.",
      table: { category: "Semantic Model" },
    },
    labelGap: {
      control: { type: "number" },
      description: "Gap between button and outside label placement.",
      table: { category: "Semantic Model" },
    },
    labelSpan: {
      control: { type: "range", min: 0.1, max: 1, step: 0.05 },
      description: "Fraction of available span used by the label.",
      table: { category: "Semantic Model" },
    },
  },
} satisfies Meta<ISvgRgbLabelButtonStoryArgs>;

export default meta;

type Story = StoryObj<ISvgRgbLabelButtonStoryArgs>;

export const Default: Story = {};

export const OutsideTop: Story = {
  args: {
    labelPlacement: "top",
    labelAlignment: "center",
    labelAttachment: "outside",
    labelGap: 8,
    labelSpan: 0.8,
  },
};
