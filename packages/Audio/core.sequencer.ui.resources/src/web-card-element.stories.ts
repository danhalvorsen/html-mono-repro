import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./web-card-element.js";

interface IWebCardStoryArgs {
  readonly headerLabel: string;
  readonly mainLabel: string;
  readonly footerLabel: string;
  readonly labelWidth: number;
  readonly labelHeight: number;
}

const meta = {
  title: "Sequencer/Web Card",
  tags: ["autodocs"],
  render: (args: IWebCardStoryArgs) => html`
    <web-card
      .headerLabel=${args.headerLabel}
      .mainLabel=${args.mainLabel}
      .footerLabel=${args.footerLabel}
      .labelWidth=${args.labelWidth}
      .labelHeight=${args.labelHeight}
      style="inline-size: 360px;"
    ></web-card>
  `,
  args: {
    headerLabel: "HEADER",
    mainLabel: "MAIN",
    footerLabel: "FOOTER",
    labelWidth: 88,
    labelHeight: 24,
  },
  argTypes: {
    headerLabel: { control: { type: "text" } },
    mainLabel: { control: { type: "text" } },
    footerLabel: { control: { type: "text" } },
    labelWidth: { control: { type: "number" } },
    labelHeight: { control: { type: "number" } },
  },
} satisfies Meta<IWebCardStoryArgs>;

export default meta;

type Story = StoryObj<IWebCardStoryArgs>;

export const Default: Story = {};
