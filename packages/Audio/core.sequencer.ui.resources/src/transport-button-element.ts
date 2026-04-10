import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import {
  createTransportButtonSvg,
  type TransportButtonVariant,
} from "./transportButton.js";
import {
  TransportButtonEvents,
  type ITransportButtonPressedDetail,
} from "./events.js";
import { normalizeTransportButtonVariant } from "./variant-normalization.js";

export class SequencerTransportButtonElement extends LitElement {
  public static readonly tagName = "sequencer-transport-button";

  public static override properties = {
    variant: { type: String, reflect: true },
    label: { type: String, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  } as const;

  declare public variant: TransportButtonVariant;
  declare public label: string;
  declare public width: number;
  declare public height: number;

  public constructor() {
    super();
    this.variant = "play";
    this.label = "";
    this.width = 88;
    this.height = 56;
  }

  public override render() {
    const resource = createTransportButtonSvg({
      id: `${SequencerTransportButtonElement.tagName}-${this.variant}`,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      variant: normalizeTransportButtonVariant(this.variant),
      ...(this.label ? { label: this.label } : {}),
    });

    return html`
      <button
        type="button"
        aria-label="${this.variant}${this.label ? ` ${this.label}` : ""}"
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
    const variant = normalizeTransportButtonVariant(this.variant);

    this.dispatchEvent(
      new CustomEvent<ITransportButtonPressedDetail>(TransportButtonEvents.pressed, {
        detail: { variant },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (!customElements.get(SequencerTransportButtonElement.tagName)) {
  customElements.define(
    SequencerTransportButtonElement.tagName,
    SequencerTransportButtonElement,
  );
}
