import { LitElement, css, html } from "lit";

import type { Digit } from "./digitButton.js";
import "./digit-button-element.js";

export class SequencerDigitButtonRowElement extends LitElement {
  public static readonly tagName = "sequencer-digit-button-row";
  private static readonly digits: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  public static override properties = {
    onDigit: { type: Number, attribute: "on-digit", reflect: true },
    activeDigit: { type: Number, attribute: "active-digit", reflect: true },
    buttonWidth: { type: Number, attribute: "button-width" },
    buttonHeight: { type: Number, attribute: "button-height" },
    gap: { type: Number },
    labelPrefix: { type: String, attribute: "label-prefix" },
  } as const;

  public static override styles = css`
    :host {
      display: inline-block;
    }

    .row {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: min-content;
      gap: var(--digit-button-gap, 8px);
      align-items: center;
    }
  `;

  declare public onDigit: number;
  declare public activeDigit: number;
  declare public buttonWidth: number;
  declare public buttonHeight: number;
  declare public gap: number;
  declare public labelPrefix: string;

  public constructor() {
    super();
    this.onDigit = -1;
    this.activeDigit = -1;
    this.buttonWidth = 88;
    this.buttonHeight = 88;
    this.gap = 8;
    this.labelPrefix = "Digit";
  }

  public override render() {
    this.style.setProperty("--digit-button-gap", `${this.gap}px`);
    const onDigit = this.onDigit >= 0 ? this.onDigit : this.activeDigit;

    return html`
      <div class="row" role="group" aria-label="Digit buttons 0 to 9">
        ${SequencerDigitButtonRowElement.digits.map(
          (digit) => html`
            <sequencer-digit-button
              .digit=${digit}
              ?on=${digit === onDigit}
              .width=${this.buttonWidth}
              .height=${this.buttonHeight}
              .labelPrefix=${this.labelPrefix}
              @digit-press=${this.handleDigitPress}
            ></sequencer-digit-button>
          `,
        )}
      </div>
    `;
  }

  private readonly handleDigitPress = (event: Event): void => {
    const customEvent = event as CustomEvent<{ digit: Digit; on?: boolean }>;
    const digit = customEvent.detail?.digit;
    const on = customEvent.detail?.on ?? true;

    if (typeof digit !== "number") {
      return;
    }

    const nextOnDigit = on ? digit : -1;
    this.onDigit = nextOnDigit;
    this.activeDigit = nextOnDigit;

    this.dispatchEvent(
      new CustomEvent("on-digit-change", {
        detail: { digit: nextOnDigit },
        bubbles: true,
        composed: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("active-digit-change", {
        detail: { digit: nextOnDigit },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (!customElements.get(SequencerDigitButtonRowElement.tagName)) {
  customElements.define(
    SequencerDigitButtonRowElement.tagName,
    SequencerDigitButtonRowElement,
  );
}
