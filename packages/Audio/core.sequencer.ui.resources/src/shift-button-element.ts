import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { createShiftButtonSvg } from "./shiftButton.js";
import { ShiftButtonEvents } from "./events.js";

export class SequencerShiftButtonElement extends LitElement {
  public static readonly tagName = "sequencer-shift-button";

  public static override properties = {
    label: { type: String, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  } as const;

  declare public label: string;
  declare public width: number;
  declare public height: number;

  public constructor() {
    super();
    this.label = "SHIFT";
    this.width = 88;
    this.height = 56;
  }

  public override render() {
    const resource = createShiftButtonSvg({
      id: `${SequencerShiftButtonElement.tagName}`,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      label: this.label || "SHIFT",
    });

    return html`
      <button
        type="button"
        aria-label="Shift"
        style=${styleMap({
          display: "inline-block",
          inlineSize: `${this.width}px`,
          blockSize: `${this.height}px`,
          border: "0",
          background: "transparent",
          margin: "0",
          padding: "0",
          cursor: "pointer",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        })}
        @click=${this.handleClick}
      >
        <div style=${styleMap({ display: "block", inlineSize: "100%", blockSize: "100%" })}>${unsafeSVG(resource.svg)}</div>
      </button>
    `;
  }

  private readonly handleClick = (): void => {
    this.dispatchEvent(
      new CustomEvent(ShiftButtonEvents.pressed, {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (!customElements.get(SequencerShiftButtonElement.tagName)) {
  customElements.define(
    SequencerShiftButtonElement.tagName,
    SequencerShiftButtonElement,
  );
}
