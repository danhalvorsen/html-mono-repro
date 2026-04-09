import { LitElement, css, html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { createRgbButtonSvg } from "./rgbButton.js";

export class SequencerRgbButtonElement extends LitElement {
  public static readonly tagName = "sequencer-rgb-button";

  public static override properties = {
    r: { type: Number, reflect: true },
    g: { type: Number, reflect: true },
    b: { type: Number, reflect: true },
    on: { type: Boolean, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  } as const;

  public static override styles = css`
    :host {
      display: inline-block;
      inline-size: var(--rgb-button-width, 88px);
      block-size: var(--rgb-button-height, 88px);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    button {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      border: 0;
      background: transparent;
      margin: 0;
      padding: 0;
      cursor: inherit;
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
      display: block;
    }
  `;

  declare public r: number;
  declare public g: number;
  declare public b: number;
  declare public on: boolean;
  declare public width: number;
  declare public height: number;

  public constructor() {
    super();
    this.r = 255;
    this.g = 0;
    this.b = 0;
    this.on = true;
    this.width = 88;
    this.height = 88;
  }

  public override render() {
    const resource = createRgbButtonSvg({
      id: `${SequencerRgbButtonElement.tagName}-${this.r}-${this.g}-${this.b}`,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      r: this.r,
      g: this.g,
      b: this.b,
      on: this.on,
    });

    return html`
      <button
        type="button"
        .ariaPressed=${this.on ? "true" : "false"}
        aria-label="RGB ${this.r}, ${this.g}, ${this.b}"
        @click=${this.handleClick}
      >
        ${unsafeSVG(resource.svg)}
      </button>
    `;
  }

  private readonly handleClick = (): void => {
    this.on = !this.on;

    this.dispatchEvent(
      new CustomEvent("rgb-button-toggle", {
        detail: {
          r: this.r,
          g: this.g,
          b: this.b,
          on: this.on,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (!customElements.get(SequencerRgbButtonElement.tagName)) {
  customElements.define(
    SequencerRgbButtonElement.tagName,
    SequencerRgbButtonElement,
  );
}
