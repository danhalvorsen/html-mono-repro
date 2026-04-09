import { LitElement, css, html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { createKnobButtonSvg, type KnobVariant } from "./knobButton.js";

export class SequencerKnobButtonElement extends LitElement {
  public static readonly tagName = "sequencer-knob-button";

  public static override properties = {
    variant: { type: String, reflect: true },
    on: { type: Boolean, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  } as const;

  public static override styles = css`
    :host {
      display: inline-block;
      inline-size: var(--knob-button-width, 88px);
      block-size: var(--knob-button-height, 88px);
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

  declare public variant: KnobVariant;
  declare public on: boolean;
  declare public width: number;
  declare public height: number;

  public constructor() {
    super();
    this.variant = "matte";
    this.on = true;
    this.width = 88;
    this.height = 88;
  }

  public override render() {
    const variant = normalizeVariant(this.variant);
    const resource = createKnobButtonSvg({
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
        .ariaPressed=${this.on ? "true" : "false"}
        aria-label="Knob ${variant}"
        @click=${this.handleClick}
      >
        ${unsafeSVG(resource.svg)}
      </button>
    `;
  }

  private readonly handleClick = (): void => {
    this.on = !this.on;

    this.dispatchEvent(
      new CustomEvent("knob-toggle", {
        detail: { variant: this.variant, on: this.on },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

function normalizeVariant(value: string): KnobVariant {
  if (
    value === "matte"
    || value === "glossy"
    || value === "ribbed"
    || value === "beveled"
  ) {
    return value;
  }

  return "matte";
}

if (!customElements.get(SequencerKnobButtonElement.tagName)) {
  customElements.define(
    SequencerKnobButtonElement.tagName,
    SequencerKnobButtonElement,
  );
}
