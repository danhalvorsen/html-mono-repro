import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { mapSizeToStorybook } from "./storybook-svg-mapping.js";
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

const unitSpace = Object.freeze({ width: 1, height: 1 });
const toneCount = 12;
const digitCount = 10;

export interface ISequencerControlsStoryArgs {
  readonly scale: number;
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

function estimateControlsStorySize(
  args: ISequencerControlsStoryArgs,
): { readonly width: number; readonly height: number } {
  const digitRowWidth = (digitCount * args.buttonWidth) + ((digitCount - 1) * args.gap);
  const toneRowWidth = (toneCount * args.buttonWidth) + ((toneCount - 1) * args.gap);
  const transportButtonCount = args.transportRowLayout === "transport-shift" ? 4 : 3;
  const transportRowWidth = (transportButtonCount * args.buttonWidth) + ((transportButtonCount - 1) * args.gap);

  const digitSectionHeight = args.buttonHeight + args.gap + args.buttonHeight;
  const rgbSectionHeight = args.buttonHeight;
  const knobSectionHeight = args.buttonHeight;
  const toneLabelHeight = args.buttonHeight * 0.2;
  const toneSectionHeight = toneLabelHeight + args.gap + toneLabelHeight;
  const transportSectionHeight = args.transportButtonHeight + args.gap + args.transportButtonHeight;
  const sectionGapHeight = (args.gap * 3) * 4;

  return Object.freeze({
    width: Math.max(
      args.buttonWidth,
      digitRowWidth,
      toneRowWidth,
      transportRowWidth,
    ),
    height:
      digitSectionHeight
      + rgbSectionHeight
      + knobSectionHeight
      + toneSectionHeight
      + transportSectionHeight
      + sectionGapHeight,
  });
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
        <svg-label
          .tone=${this.tone}
          .buttonWidth=${this.buttonWidth}
          .buttonHeight=${this.buttonHeight}
        ></svg-label>

        <svg-label-tones
          .buttonWidth=${this.buttonWidth}
          .buttonHeight=${this.buttonHeight}
          .gap=${this.gap}
        ></svg-label-tones>
      </div>
    `;
  }

  private renderTransportSection(): TemplateResult {
    return html`
      <div style="display: grid; gap: ${this.gap}px;">
        <play-button
          .variant=${this.transportVariant}
          .label=${this.transportLabel}
          .width=${this.buttonWidth}
          .height=${this.transportButtonHeight}
        ></play-button>

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

@customElement("sequencer-controls-story-frame")
export class SequencerControlsStoryFrame extends LitElement {
  @property({ type: Number, attribute: "requested-scale" })
  public requestedScale = 0.5;

  @property({ type: Number, attribute: "content-width" })
  public contentWidth = 0;

  @property({ type: Number, attribute: "content-height" })
  public contentHeight = 0;

  private resizeObserver: ResizeObserver | null = null;
  private availableWidth = 0;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const nextWidth = entry?.contentRect.width ?? 0;

      if (nextWidth !== this.availableWidth) {
        this.availableWidth = nextWidth;
        this.requestUpdate();
      }
    });

    this.resizeObserver.observe(this);
  }

  public override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    super.disconnectedCallback();
  }

  public override render(): TemplateResult {
    const fitScale =
      this.contentWidth > 0 && this.availableWidth > 0
        ? Math.min(this.requestedScale, this.availableWidth / this.contentWidth)
        : this.requestedScale;

    const mappedSize = mapSizeToStorybook(
      { width: this.contentWidth, height: this.contentHeight },
      unitSpace,
      { width: fitScale, height: fitScale },
    );

    return html`
      <div
        style=${[
          "padding: 24px",
          "overflow: auto",
          "box-sizing: border-box",
          "width: 100%",
        ].join(";")}
      >
        <div
          style=${[
            "position: relative",
            `width: ${mappedSize.width}px`,
            `height: ${mappedSize.height}px`,
            "overflow: hidden",
          ].join(";")}
        >
          <div
            style=${[
              "position: absolute",
              "inset: 0 auto auto 0",
              "width: max-content",
              `transform: scale(${fitScale})`,
              "transform-origin: top left",
            ].join(";")}
          >
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

const meta = {
  title: "Sequencer/Controls",
  tags: ["autodocs"],
  render: (args: ISequencerControlsStoryArgs) => {
    const contentSize = estimateControlsStorySize(args);

    return html`
      <sequencer-controls-story-frame
        .requestedScale=${args.scale}
        .contentWidth=${contentSize.width}
        .contentHeight=${contentSize.height}
      >
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
      </sequencer-controls-story-frame>
    `;
  },
  parameters: {
    layout: "fullscreen",
  },
  args: {
    scale: 0.5,
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
  argTypes: {
    scale: {
      control: { type: "range", min: 0.25, max: 1.5, step: 0.05 },
    },
    knobVariant: {
      control: { type: "select" },
      options: ["matte", "glossy", "ribbed", "beveled"],
    },
    tone: {
      control: { type: "select" },
      options: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
    },
    transportVariant: {
      control: { type: "select" },
      options: ["play", "stop", "record"],
    },
    transportRowLayout: {
      control: { type: "select" },
      options: ["transport", "transport-shift"],
    },
  },
} satisfies Meta<ISequencerControlsStoryArgs>;

export default meta;

type Story = StoryObj<ISequencerControlsStoryArgs>;

export const Default: Story = {};
