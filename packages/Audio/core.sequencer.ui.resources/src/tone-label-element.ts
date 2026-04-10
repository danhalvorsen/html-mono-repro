import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import {
  createToneLabelSvg,
  TONE_SCALE,
  type ToneLabel,
} from "./toneLabel.js";

const toneSet = new Set<string>(TONE_SCALE);

export class SequencerToneLabelElement extends LitElement {
  public static readonly tagName = "sequencer-tone-label";

  public static override properties = {
    tone: { type: String, reflect: true },
    buttonWidth: { type: Number, attribute: "button-width", reflect: true },
    buttonHeight: { type: Number, attribute: "button-height", reflect: true },
  } as const;

  declare public tone: ToneLabel;
  declare public buttonWidth: number;
  declare public buttonHeight: number;

  public constructor() {
    super();
    this.tone = "C";
    this.buttonWidth = 88;
    this.buttonHeight = 88;
  }

  public override render() {
    const tone = normalizeTone(this.tone);
    const resource = createToneLabelSvg({
      id: `${SequencerToneLabelElement.tagName}-${tone}`,
      x: 0,
      y: 0,
      buttonWidth: this.buttonWidth,
      buttonHeight: this.buttonHeight,
      tone,
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
}

function normalizeTone(value: string): ToneLabel {
  return (toneSet.has(value) ? value : "C") as ToneLabel;
}

if (!customElements.get(SequencerToneLabelElement.tagName)) {
  customElements.define(
    SequencerToneLabelElement.tagName,
    SequencerToneLabelElement,
  );
}
