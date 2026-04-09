import { LitElement, css, html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { createToneLabelSvg, type ToneLabel } from "./toneLabel.js";

export class SequencerToneLabelElement extends LitElement {
  public static readonly tagName = "sequencer-tone-label";

  public static override properties = {
    tone: { type: String, reflect: true },
    buttonWidth: { type: Number, attribute: "button-width", reflect: true },
    buttonHeight: { type: Number, attribute: "button-height", reflect: true },
  } as const;

  public static override styles = css`
    :host {
      display: inline-block;
      inline-size: var(--tone-label-width, 88px);
      block-size: var(--tone-label-height, 17.6px);
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
      display: block;
    }
  `;

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

    this.style.setProperty("--tone-label-width", `${resource.labelWidth}px`);
    this.style.setProperty("--tone-label-height", `${resource.labelHeight}px`);

    return html`${unsafeSVG(resource.svg)}`;
  }
}

function normalizeTone(value: string): ToneLabel {
  const tones = new Set([
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ]);

  return (tones.has(value) ? value : "C") as ToneLabel;
}

if (!customElements.get(SequencerToneLabelElement.tagName)) {
  customElements.define(
    SequencerToneLabelElement.tagName,
    SequencerToneLabelElement,
  );
}
