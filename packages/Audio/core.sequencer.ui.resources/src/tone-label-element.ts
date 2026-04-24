import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { TONE_SCALE, type ToneLabel } from "./toneLabel.js";
import { createSvgLabelSvg } from "./svgLabel.js";
import { controlStyles } from "./styleSystem.js";

const toneSet = new Set<string>(TONE_SCALE);
const svgLabelStates = ["active", "inactive"] as const;
const baseToneLabelStyle = controlStyles.toneLabel.create();

export type SvgLabelState = (typeof svgLabelStates)[number];

const svgLabelStateStyles: Readonly<Record<SvgLabelState, Readonly<{
  fillColor: string;
  fillOpacity: number;
  textColor: string;
}>>> = Object.freeze({
  active: Object.freeze({
    fillColor: baseToneLabelStyle.fillColor,
    fillOpacity: 1,
    textColor: baseToneLabelStyle.textColor,
  }),
  inactive: Object.freeze({
    fillColor: baseToneLabelStyle.fillColor,
    fillOpacity: 0.5,
    textColor: baseToneLabelStyle.textColor,
  }),
});

export class SvgLabelElement extends LitElement {
  public static readonly tagName = "svg-label";
  public static readonly legacyTagName = "sequencer-tone-label";

  public static override properties = {
    label: { type: String, reflect: true },
    tone: { type: String, reflect: true },
    state: { type: String, reflect: true },
    buttonWidth: { type: Number, attribute: "button-width", reflect: true },
    buttonHeight: { type: Number, attribute: "button-height", reflect: true },
    fillColor: { type: String, attribute: "fill-color", reflect: true },
    fillOpacity: { type: Number, attribute: "fill-opacity", reflect: true },
    textColor: { type: String, attribute: "text-color", reflect: true },
    margin: { type: Number, reflect: true },
  } as const;

  declare public label: string;
  declare public tone: ToneLabel;
  declare public state: SvgLabelState;
  declare public buttonWidth: number;
  declare public buttonHeight: number;
  declare public fillColor: string;
  declare public fillOpacity: number;
  declare public textColor: string;
  declare public margin: number;

  public constructor() {
    super();
    this.label = "C";
    this.tone = "C";
    this.state = "active";
    this.buttonWidth = 88;
    this.buttonHeight = 88;
    this.fillColor = "";
    this.fillOpacity = 1;
    this.textColor = "";
    this.margin = 8;
  }

  public override render() {
    const label = normalizeLabel(this.label, this.tone);
    const buttonWidth = this.resolvePositiveSize(this.buttonWidth, 88);
    const buttonHeight = this.resolvePositiveSize(this.buttonHeight, 88);
    const styleOverrides = this.resolveStyleOverrides();
    const resource = createSvgLabelSvg({
      id: `${SvgLabelElement.tagName}-${label}`,
      x: 0,
      y: 0,
      buttonWidth,
      buttonHeight: this.resolveSourceButtonHeight(buttonWidth, buttonHeight),
      label,
      ...(styleOverrides === undefined ? {} : { style: styleOverrides }),
    });

    return html`
      <div style=${styleMap({
        "inline-size": `${resource.labelWidth}px`,
        "block-size": `${resource.labelHeight}px`,
        "display": "block",
      })}>
        ${unsafeSVG(resource.svg)}
      </div>
    `;
  }

  private resolveSourceButtonHeight(buttonWidth: number, buttonHeight: number): number {
    if (buttonHeight >= buttonWidth) {
      return buttonHeight;
    }

    return buttonHeight * 5;
  }

  private resolvePositiveSize(value: number, fallback: number): number {
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private resolveStyleOverrides():
    | {
        fillColor?: string;
        fillOpacity?: number;
        textColor?: string;
        marginPercent?: number;
      }
    | undefined {
    const style: {
      fillColor?: string;
      fillOpacity?: number;
      textColor?: string;
      marginPercent?: number;
    } = {};

    const stateStyle = svgLabelStateStyles[this.resolveState()];
    const fillColor = typeof this.fillColor === "string" ? this.fillColor : String(this.fillColor ?? "");
    const textColor = typeof this.textColor === "string" ? this.textColor : String(this.textColor ?? "");

    if (fillColor.trim().length > 0) {
      style.fillColor = fillColor;
    } else {
      style.fillColor = stateStyle.fillColor;
    }

    if (this.fillOpacity !== 1) {
      style.fillOpacity = this.fillOpacity;
    } else {
      style.fillOpacity = stateStyle.fillOpacity;
    }

    if (textColor.trim().length > 0) {
      style.textColor = textColor;
    } else {
      style.textColor = stateStyle.textColor;
    }

    style.marginPercent = this.margin;

    return Object.keys(style).length > 0 ? style : undefined;
  }

  private resolveState(): SvgLabelState {
    return svgLabelStates.includes(this.state as SvgLabelState)
      ? this.state
      : "active";
  }
}

function normalizeLabel(label: string, tone: string): string {
  const normalizedLabel = label.trim();
  if (normalizedLabel.length > 0) {
    return normalizedLabel;
  }

  return (toneSet.has(tone) ? tone : "C") as ToneLabel;
}

export class SequencerToneLabelElement extends SvgLabelElement {}

if (!customElements.get(SvgLabelElement.tagName)) {
  customElements.define(SvgLabelElement.tagName, SvgLabelElement);
}

if (!customElements.get(SvgLabelElement.legacyTagName)) {
  customElements.define(
    SvgLabelElement.legacyTagName,
    SequencerToneLabelElement,
  );
}
