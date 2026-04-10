import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { KnobButtonSvgFactory, type KnobVariant } from "./knobButton.js";
import {
  KnobButtonEvents,
  type IKnobButtonToggleRequestedDetail,
} from "./events.js";
import { normalizeKnobVariant } from "./variant-normalization.js";

export class SequencerKnobButtonElement extends LitElement {
  public static readonly tagName = "sequencer-knob-button";

  public static override properties = {
    variant: { type: String, reflect: true },
    on: { type: Boolean, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  } as const;

  declare public variant: KnobVariant;
  declare public on: boolean;
  declare public width: number;
  declare public height: number;

  private static readonly svgFactory = new KnobButtonSvgFactory();

  public constructor() {
    super();
    this.variant = "matte";
    this.on = true;
    this.width = 88;
    this.height = 88;
  }

  public override render() {
    const variant = normalizeKnobVariant(this.variant);
    const resource = SequencerKnobButtonElement.svgFactory.create({
      id: `${SequencerKnobButtonElement.tagName}-${variant}`,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      on: this.on,
      variant,
    });

    return html`
      <button
        type="button"
        aria-pressed=${this.on ? "true" : "false"}
        aria-label="Knob ${variant}"
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
    const variant = normalizeKnobVariant(this.variant);

    const detail: IKnobButtonToggleRequestedDetail = {
      variant,
      on: !this.on,
    };

    this.dispatchEvent(
      new CustomEvent<IKnobButtonToggleRequestedDetail>(
        KnobButtonEvents.toggleRequested,
        {
          detail,
          bubbles: true,
          composed: true,
        },
      ),
    );
  };
}

if (!customElements.get(SequencerKnobButtonElement.tagName)) {
  customElements.define(
    SequencerKnobButtonElement.tagName,
    SequencerKnobButtonElement,
  );
}
