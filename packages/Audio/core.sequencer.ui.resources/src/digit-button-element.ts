import { SemanticShapesComposition } from "@monorepo/core-semantic-model-shapes";
import { LitElement, html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { styleMap } from "lit/directives/style-map.js";
import { createButtonRectangleShape } from "./button-rectangle-shape.js";
import { createDigitButtonSvg, type Digit } from "./digitButton.js";
import {
  DigitButtonEvents,
  type IDigitButtonPressedDetail,
} from "./events.js";

const rectangleFactory = new SemanticShapesComposition().rectangleFactory;

export class SequencerDigitButtonElement extends LitElement {
  public static readonly tagName = "sequencer-digit-button";
  private static readonly digitMin = 0;
  private static readonly digitMax = 9;

  public static override properties = {
    digit: { type: Number, reflect: true },
    selected: { type: Boolean, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
    labelPrefix: { type: String, attribute: "label-prefix" },
  } as const;

  declare public digit: number;
  declare public selected: boolean;
  declare public width: number;
  declare public height: number;
  declare public labelPrefix: string;

  public constructor() {
    super();
    this.digit = 0;
    this.selected = false;
    this.width = 88;
    this.height = 88;
    this.labelPrefix = "Digit";
  }

  public override render() {
    const digit = this.clampDigit(this.digit);

    const resource = createDigitButtonSvg({
      shape: createButtonRectangleShape(rectangleFactory, {
        id: `${SequencerDigitButtonElement.tagName}-${digit}`,
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      }),
      id: `${SequencerDigitButtonElement.tagName}-${digit}`,
      digit,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      on: this.selected,
    });

    return html`
      <button
        type="button"
        aria-pressed=${this.selected ? "true" : "false"}
        aria-label="${this.labelPrefix} ${digit}"
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
    const detail: IDigitButtonPressedDetail = {
      digit: this.clampDigit(this.digit),
    };

    this.dispatchEvent(
      new CustomEvent<IDigitButtonPressedDetail>(DigitButtonEvents.pressed, {
        detail,
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
