import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./digit-button-element.js";
import "./digit-button-row-element.js";
import "./rgb-button-element.js";
import "./knob-button-element.js";
import "./tone-label-element.js";
import "./tone-label-row-element.js";
import "./transport-button-element.js";
import "./transport-row-element.js";
import "./shift-button-element.js";

type KnobVariant = "matte" | "glossy" | "ribbed" | "beveled";
type ToneLabel =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";
type TransportVariant = "play" | "stop" | "record";
type TransportRowLayout = "transport" | "transport-shift";

export interface ISequencerControlsStoryArgs {
  readonly digit: number;
  readonly selected: boolean;
  readonly selectedDigit: number;
  readonly digitLabelPrefix: string;
  readonly rgbR: number;
  readonly rgbG: number;
  readonly rgbB: number;
  readonly rgbOn: boolean;
  readonly knobVariant: KnobVariant;
  readonly knobOn: boolean;
  readonly tone: ToneLabel;
  readonly transportVariant: TransportVariant;
  readonly transportLabel: string;
  readonly transportRowLayout: TransportRowLayout;
  readonly shiftLabel: string;
  readonly buttonWidth: number;
  readonly buttonHeight: number;
  readonly transportButtonHeight: number;
  readonly gap: number;
}

@customElement("sequencer-controls-story-host")
export class SequencerControlsStoryHost extends LitElement {
  @property({ type: Number })
  public digit = 3;

  @property({ type: Boolean })
  public selected = false;

  @property({ type: Number, attribute: "selected-digit" })
  public selectedDigit = -1;

  @property({ type: String, attribute: "digit-label-prefix" })
  public digitLabelPrefix = "Digit";

  @property({ type: Number, attribute: "rgb-r" })
  public rgbR = 255;

  @property({ type: Number, attribute: "rgb-g" })
  public rgbG = 64;

  @property({ type: Number, attribute: "rgb-b" })
  public rgbB = 64;

  @property({ type: Boolean, attribute: "rgb-on" })
  public rgbOn = true;

  @property({ type: String, attribute: "knob-variant" })
  public knobVariant: KnobVariant = "matte";

  @property({ type: Boolean, attribute: "knob-on" })
  public knobOn = true;

  @property({ type: String })
  public tone: ToneLabel = "C";

  @property({ type: String, attribute: "transport-variant" })
  public transportVariant: TransportVariant = "play";

  @property({ type: String, attribute: "transport-label" })
  public transportLabel = "tap";

  @property({ type: String, attribute: "transport-row-layout" })
  public transportRowLayout: TransportRowLayout = "transport-shift";

  @property({ type: String, attribute: "shift-label" })
  public shiftLabel = "SHIFT";

  @property({ type: Number, attribute: "button-width" })
  public buttonWidth = 88;

  @property({ type: Number, attribute: "button-height" })
  public buttonHeight = 88;

  @property({ type: Number, attribute: "transport-button-height" })
  public transportButtonHeight = 56;

  @property({ type: Number })
  public gap = 8;

  public override render(): TemplateResult {
    return html`
      <div
        style="
          display: grid;
          gap: ${this.gap * 3}px;
        "
      >
        ${this.renderDigitSection()}
        ${this.renderRgbSection()}
        ${this.renderKnobSection()}
        ${this.renderToneSection()}
        ${this.renderTransportSection()}
      </div>
    `;
  }

  private renderDigitSection(): TemplateResult {
    return html`
      <div style="display: grid; gap: ${this.gap}px;">
        <sequencer-digit-button
          .digit=${this.digit}
          .selected=${this.selected}
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
          .labelPrefix=${this.digitLabelPrefix}
        ></sequencer-digit-button>

        <sequencer-digit-button-row
          .selectedDigit=${this.selectedDigit}
          .buttonWidth=${this.buttonWidth}
          .buttonHeight=${this.buttonHeight}
          .gap=${this.gap}
          .labelPrefix=${this.digitLabelPrefix}
        ></sequencer-digit-button-row>
      </div>
    `;
  }

  private renderRgbSection(): TemplateResult {
    return html`
      <div style="display: grid; gap: ${this.gap}px;">
        <sequencer-rgb-button
          .r=${this.rgbR}
          .g=${this.rgbG}
          .b=${this.rgbB}
          .on=${this.rgbOn}
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
        ></sequencer-rgb-button>
      </div>
    `;
  }

  private renderKnobSection(): TemplateResult {
    return html`
      <div style="display: grid; gap: ${this.gap}px;">
        <sequencer-knob-button
          .variant=${this.knobVariant}
          .on=${this.knobOn}
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
        ></sequencer-knob-button>
      </div>
    `;
  }

  private renderToneSection(): TemplateResult {
    return html`
      <div style="display: grid; gap: ${this.gap}px;">
        <sequencer-tone-label
          .tone=${this.tone}
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
        ></sequencer-tone-label>

        <sequencer-tone-label-row
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
          .gap=${this.gap}
        ></sequencer-tone-label-row>
      </div>
    `;
  }

  private renderTransportSection(): TemplateResult {
    return html`
      <div style="display: grid; gap: ${this.gap}px;">
        <sequencer-transport-button
          .variant=${this.transportVariant}
          .label=${this.transportLabel}
          .width=${this.buttonWidth}
          .height=${this.transportButtonHeight}
        ></sequencer-transport-button>

        <sequencer-transport-row
          .layout=${this.transportRowLayout}
          .buttonWidth=${this.buttonWidth}
          .buttonHeight=${this.transportButtonHeight}
          .gap=${this.gap}
          .shiftLabel=${this.shiftLabel}
        ></sequencer-transport-row>
      </div>
    `;
  }
}

const meta = {
  title: "Sequencer/Controls",
  tags: ["autodocs"],
  render: (args: ISequencerControlsStoryArgs) => html`
    <sequencer-controls-story-host
      .digit=${args.digit}
      .selected=${args.selected}
      .selectedDigit=${args.selectedDigit}
      .digitLabelPrefix=${args.digitLabelPrefix}
      .rgbR=${args.rgbR}
      .rgbG=${args.rgbG}
      .rgbB=${args.rgbB}
      .rgbOn=${args.rgbOn}
      .knobVariant=${args.knobVariant}
      .knobOn=${args.knobOn}
      .tone=${args.tone}
      .transportVariant=${args.transportVariant}
      .transportLabel=${args.transportLabel}
      .transportRowLayout=${args.transportRowLayout}
      .shiftLabel=${args.shiftLabel}
      .buttonWidth=${args.buttonWidth}
      .buttonHeight=${args.buttonHeight}
      .transportButtonHeight=${args.transportButtonHeight}
      .gap=${args.gap}
    ></sequencer-controls-story-host>
  `,
  args: {
    digit: 3,
    selected: false,
    selectedDigit: -1,
    digitLabelPrefix: "Digit",
    rgbR: 255,
    rgbG: 64,
    rgbB: 64,
    rgbOn: true,
    knobVariant: "matte",
    knobOn: true,
    tone: "C",
    transportVariant: "play",
    transportLabel: "tap",
    transportRowLayout: "transport-shift",
    shiftLabel: "SHIFT",
    buttonWidth: 88,
    buttonHeight: 88,
    transportButtonHeight: 56,
    gap: 8,
  },
} satisfies Meta<ISequencerControlsStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerControlsStoryArgs>;

export const Default: Story = {};