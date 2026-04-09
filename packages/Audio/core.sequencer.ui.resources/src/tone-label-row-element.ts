import { LitElement, css, html } from "lit";

import { TONE_SCALE } from "./toneLabel.js";
import "./tone-label-element.js";

export class SequencerToneLabelRowElement extends LitElement {
  public static readonly tagName = "sequencer-tone-label-row";

  public static override properties = {
    buttonWidth: { type: Number, attribute: "button-width", reflect: true },
    buttonHeight: { type: Number, attribute: "button-height", reflect: true },
    gap: { type: Number, reflect: true },
  } as const;

  public static override styles = css`
    :host {
      display: inline-block;
    }

    .row {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: min-content;
      gap: var(--tone-label-gap, 8px);
      align-items: center;
    }
  `;

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
    this.style.setProperty("--tone-label-gap", `${this.gap}px`);

    return html`
      <div class="row" role="group" aria-label="Tone scale labels">
        ${TONE_SCALE.map(
          (tone) => html`
            <sequencer-tone-label
              .tone=${tone}
              .buttonWidth=${this.buttonWidth}
              .buttonHeight=${this.buttonHeight}
            ></sequencer-tone-label>
          `,
        )}
      </div>
    `;
  }
}

if (!customElements.get(SequencerToneLabelRowElement.tagName)) {
  customElements.define(
    SequencerToneLabelRowElement.tagName,
    SequencerToneLabelRowElement,
  );
}
