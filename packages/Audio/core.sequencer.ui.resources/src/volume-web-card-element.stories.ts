import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./volume-web-card-element.js";

interface IVolumeWebCardStoryArgs {
  readonly angle: number;
  readonly variant: "matte" | "glossy" | "ribbed" | "beveled";
  readonly on: boolean;
  readonly mode: "free" | "stepped" | "sector";
  readonly steps: number;
  readonly sectorMin: number;
  readonly sectorMax: number;
  readonly knobWidth: number;
  readonly knobHeight: number;
  readonly labelWidth: number;
  readonly labelHeight: number;
}

const meta = {
  title: "Sequencer/Volume Web Card",
  tags: ["autodocs"],
  render: (args: IVolumeWebCardStoryArgs) => html`
    <volume-web-card
      .angle=${args.angle}
      .variant=${args.variant}
      .on=${args.on}
      .mode=${args.mode}
      .steps=${args.steps}
      .sectorMin=${args.sectorMin}
      .sectorMax=${args.sectorMax}
      .knobWidth=${args.knobWidth}
      .knobHeight=${args.knobHeight}
      .labelWidth=${args.labelWidth}
      .labelHeight=${args.labelHeight}
      style="inline-size: 220px;"
    ></volume-web-card>
  `,
  args: {
    angle: 90,
    variant: "matte",
    on: true,
    mode: "free",
    steps: 20,
    sectorMin: 180,
    sectorMax: 0,
    knobWidth: 88,
    knobHeight: 88,
    labelWidth: 120,
    labelHeight: 24,
  },
  argTypes: {
    angle: { control: { type: "number" } },
    variant: { control: { type: "select" }, options: ["matte", "glossy", "ribbed", "beveled"] },
    on: { control: { type: "boolean" } },
    mode: { control: { type: "select" }, options: ["free", "stepped", "sector"] },
    steps: { control: { type: "number" } },
    sectorMin: { control: { type: "number" } },
    sectorMax: { control: { type: "number" } },
    knobWidth: { control: { type: "number" } },
    knobHeight: { control: { type: "number" } },
    labelWidth: { control: { type: "number" } },
    labelHeight: { control: { type: "number" } },
  },
} satisfies Meta<IVolumeWebCardStoryArgs>;

export default meta;

type Story = StoryObj<IVolumeWebCardStoryArgs>;

export const Default: Story = {};
