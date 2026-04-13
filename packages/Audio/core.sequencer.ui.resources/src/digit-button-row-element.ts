import { LitElement, html } from "lit";

import { styleMap } from "lit/directives/style-map.js";

import type { Digit } from "./digitButton.js";
import {
  DigitButtonRowEvents,
  type IDigitButtonPressedDetail,
  type IDigitButtonRowSelectionChangedDetail,
} from "./events.js";
import "./digit-button-element.js";

export class SequencerDigitButtonRowElement extends LitElement {
  public static readonly tagName = "sequencer-digit-button-row";
  private static readonly digits: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  public static override properties = {
    selectedDigit: { type: Number, attribute: "selected-digit", reflect: true },
    buttonWidth: { type: Number, attribute: "button-width" },
    buttonHeight: { type: Number, attribute: "button-height" },
    gap: { type: Number },
    labelPrefix: { type: String, attribute: "label-prefix" },
  } as const;

  declare public selectedDigit: number;
  declare public buttonWidth: number;
  declare public buttonHeight: number;
  declare public gap: number;
  declare public labelPrefix: string;

  public constructor() {
    super();
    this.selectedDigit = -1;
    this.buttonWidth = 88;
    this.buttonHeight = 88;
    this.gap = 8;
    this.labelPrefix = "Digit";
  }

  public override render() {
    return html`
      <div
        class="row"
        role="group"
        aria-label="Digit buttons 0 to 9"
        style=${styleMap({
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "min-content",
          alignItems: "center",
          gap: `${this.gap}px`,
        })}
      >
        ${SequencerDigitButtonRowElement.digits.map(
          (digit) => html`
            <sequencer-digit-button
              .digit=${digit}
              ?selected=${digit === this.selectedDigit}
              .width=${this.buttonWidth}
              .height=${this.buttonHeight}
              .labelPrefix=${this.labelPrefix}
              @digit-press=${this.handleDigitPressed}
            ></sequencer-digit-button>
          `,
        )}
      </div>
    `;
  }

  private readonly handleDigitPressed = (
    event: CustomEvent<IDigitButtonPressedDetail>,
  ): void => {
    const digit = event.detail?.digit;

    if (digit === undefined) {
      return;
    }

    const nextSelected: IDigitButtonRowSelectionChangedDetail["selectedDigit"] =
      digit === this.selectedDigit ? -1 : digit;
    this.selectedDigit = nextSelected;

    const detail: IDigitButtonRowSelectionChangedDetail = {
      selectedDigit: nextSelected,
    };

    this.dispatchEvent(
      new CustomEvent<IDigitButtonRowSelectionChangedDetail>(
        DigitButtonRowEvents.selectionChanged,
        { detail, bubbles: true, composed: true },
      ),
    );
  };
}

if (!customElements.get(SequencerDigitButtonRowElement.tagName)) {
  customElements.define(
    SequencerDigitButtonRowElement.tagName,
    SequencerDigitButtonRowElement,
  );
}
