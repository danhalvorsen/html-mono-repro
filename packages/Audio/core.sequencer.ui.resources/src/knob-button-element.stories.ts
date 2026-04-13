import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { type IKnobButtonCircularDraggingDetail } from "./events.js";
import "./knob-button-element.js";

interface ISequencerKnobButtonStoryArgs {
  readonly variant: "matte" | "glossy" | "ribbed" | "beveled";
  readonly on: boolean;
  readonly angle: number;
  readonly mode: "free" | "stepped" | "sector";
  readonly steps: number;
  readonly sectorMin: number;
  readonly sectorMax: number;
  readonly width: number;
  readonly height: number;
}

@customElement("sequencer-knob-interaction-story")
class SequencerKnobInteractionStory extends LitElement {
  @property({ type: String })
  public variant: ISequencerKnobButtonStoryArgs["variant"] = "matte";

  @property({ type: Boolean })
  public on = true;

  @property({ type: Number })
  public angle = 90;

  @property({ type: String })
  public mode: ISequencerKnobButtonStoryArgs["mode"] = "free";

  @property({ type: Number })
  public steps = 20;

  @property({ type: Number, attribute: "sector-min" })
  public sectorMin = 180;

  @property({ type: Number, attribute: "sector-max" })
  public sectorMax = 0;

  @property({ type: Number })
  public width = 88;

  @property({ type: Number })
  public height = 88;

  @state()
  private dragDirection = "none";

  @state()
  private dragSpeed = 0;

  @state()
  private isDragging = false;

  @state()
  private liveAngle = 90;

  public override render(): TemplateResult {
    return html`
      <div
        style="
          display: grid;
          gap: 12px;
          justify-items: start;
        "
      >
        <sequencer-knob-button
          .variant=${this.variant}
          .on=${this.on}
          .angle=${this.angle}
          .mode=${this.mode}
          .steps=${this.steps}
          .sectorMin=${this.sectorMin}
          .sectorMax=${this.sectorMax}
          .width=${this.width}
          .height=${this.height}
          @knob-circular-drag=${this.handleCircularDraggingChanged}
        ></sequencer-knob-button>

        <div
          style="
            display: grid;
            gap: 4px;
            font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            color: #d8e0f2;
          "
        >
          <div>Drag around the knob.</div>
          <div>direction: ${this.dragDirection}</div>
          <div>speed01: ${this.dragSpeed.toFixed(3)}</div>
          <div>angle: ${this.liveAngle.toFixed(1)}</div>
          <div>dragging: ${this.isDragging ? "yes" : "no"}</div>
        </div>
      </div>
    `;
  }

  private readonly handleCircularDraggingChanged = (
    event: CustomEvent<IKnobButtonCircularDraggingDetail>,
  ): void => {
    this.dragDirection = event.detail.sample.direction;
    this.dragSpeed = event.detail.sample.normalizedSpeed;
    this.isDragging = event.detail.sample.isDragging;
    const knob = this.renderRoot.querySelector("sequencer-knob-button") as
      | (HTMLElement & { angle?: number })
      | null;
    this.liveAngle = knob?.angle ?? this.angle;
  };
}

const meta = {
  title: "Sequencer/Knob Button",
  tags: ["autodocs"],
  render: (args: ISequencerKnobButtonStoryArgs) => html`
    <sequencer-knob-button
      .variant=${args.variant}
      .on=${args.on}
      .angle=${args.angle}
      .mode=${args.mode}
      .steps=${args.steps}
      .sectorMin=${args.sectorMin}
      .sectorMax=${args.sectorMax}
      .width=${args.width}
      .height=${args.height}
    ></sequencer-knob-button>
  `,
  args: {
    variant: "matte",
    on: true,
    angle: 90,
    mode: "free",
    steps: 20,
    sectorMin: 180,
    sectorMax: 0,
    width: 88,
    height: 88,
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["matte", "glossy", "ribbed", "beveled"],
    },
    on: { control: { type: "boolean" } },
    angle: { control: { type: "number" } },
    mode: {
      control: { type: "select" },
      options: ["free", "stepped", "sector"],
    },
    steps: { control: { type: "number" } },
    sectorMin: { control: { type: "number" } },
    sectorMax: { control: { type: "number" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<ISequencerKnobButtonStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerKnobButtonStoryArgs>;

export const Default: Story = {};

export const InteractiveDrag: Story = {
  render: (args: ISequencerKnobButtonStoryArgs) => html`
    <sequencer-knob-interaction-story
      .variant=${args.variant}
      .on=${args.on}
      .angle=${args.angle}
      .mode=${args.mode}
      .steps=${args.steps}
      .sectorMin=${args.sectorMin}
      .sectorMax=${args.sectorMax}
      .width=${args.width}
      .height=${args.height}
    ></sequencer-knob-interaction-story>
  `,
};
