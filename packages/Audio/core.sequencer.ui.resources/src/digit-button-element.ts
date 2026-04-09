import { LitElement, css, html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { createDigitButtonSvg, type Digit } from "./digitButton.js";

export class SequencerDigitButtonElement extends LitElement {
  public static readonly tagName = "sequencer-digit-button";
  private static readonly digitMin = 0;
  private static readonly digitMax = 9;

  public static override properties = {
    digit: { type: Number, reflect: true },
    on: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
    labelPrefix: { type: String, attribute: "label-prefix" },
  } as const;

  public static override styles = css`
    :host {
      display: inline-block;
      inline-size: var(--digit-button-width, 88px);
      block-size: var(--digit-button-height, 88px);
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

    :host([active]) {
      filter: drop-shadow(0 4px 10px rgba(23, 215, 255, 0.35));
    }

    :host([on]) {
      filter: drop-shadow(0 4px 10px rgba(23, 215, 255, 0.35));
    }
  `;

  declare public digit: number;
  declare public on: boolean;
  declare public active: boolean;
  declare public width: number;
  declare public height: number;
  declare public labelPrefix: string;

  public constructor() {
    super();
    this.digit = 0;
    this.on = false;
    this.active = false;
    this.width = 88;
    this.height = 88;
    this.labelPrefix = "Digit";
  }

  public override render() {
    const digit = this.clampDigit(this.digit);
    const on = this.on || this.active;

    const resource = createDigitButtonSvg({
      id: `${SequencerDigitButtonElement.tagName}-${digit}`,
      digit,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      on,
    });

    return html`
      <button
        type="button"
        .ariaPressed=${on ? "true" : "false"}
        aria-label="${this.labelPrefix} ${digit}"
        @click=${this.handleClick}
      >
        ${unsafeSVG(resource.svg)}
      </button>
    `;
  }

  private readonly handleClick = (): void => {
    this.on = !(this.on || this.active);
    this.active = this.on;

    this.dispatchEvent(
      new CustomEvent("digit-press", {
        detail: { digit: this.clampDigit(this.digit), on: this.on },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private clampDigit(value: number): Digit {
    if (!Number.isFinite(value)) {
      return SequencerDigitButtonElement.digitMin;
    }

    const rounded = Math.round(value);
    return Math.min(
      SequencerDigitButtonElement.digitMax,
      Math.max(SequencerDigitButtonElement.digitMin, rounded),
    ) as Digit;
  }
}

if (!customElements.get(SequencerDigitButtonElement.tagName)) {
  customElements.define(
    SequencerDigitButtonElement.tagName,
    SequencerDigitButtonElement,
  );
}
