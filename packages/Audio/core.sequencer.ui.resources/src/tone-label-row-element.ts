import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

import { TONE_SCALE } from "./toneLabel.js";
import "./tone-label-element.js";

export class SvgLabelTonesElement extends LitElement {
  public static readonly tagName = "svg-label-tones";
  public static readonly legacyTagName = "sequencer-tone-label-row";

  public static override properties = {
    buttonWidth: { type: Number, attribute: "button-width", reflect: true },
    buttonHeight: { type: Number, attribute: "button-height", reflect: true },
    gap: { type: Number, reflect: true },
  } as const;

  declare public buttonWidth: number;
  declare public buttonHeight: number;
  declare public gap: number;

  public constructor() {
    super();
    this.buttonWidth = 88;
    this.buttonHeight = 88;
    this.gap = 8;
  }

  public override render() {
    return html`
      <div
        class="row"
        role="group"
        aria-label="Tone scale labels"
        style=${styleMap({
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "min-content",
          alignItems: "center",
          gap: `${this.gap}px`,
        })}
      >
        ${TONE_SCALE.map(
          (tone) => html`
            <svg-label
              .tone=${tone}
              .buttonWidth=${this.buttonWidth}
              .buttonHeight=${this.buttonHeight}
            ></svg-label>
          `,
        )}
      </div>
    `;
  }
}

export class SequencerToneLabelRowElement extends SvgLabelTonesElement {}

if (!customElements.get(SvgLabelTonesElement.tagName)) {
  customElements.define(SvgLabelTonesElement.tagName, SvgLabelTonesElement);
}

if (!customElements.get(SvgLabelTonesElement.legacyTagName)) {
  customElements.define(
    SvgLabelTonesElement.legacyTagName,
    SequencerToneLabelRowElement,
  );
}
