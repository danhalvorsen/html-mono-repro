import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

import "./transport-button-element.js";
import "./shift-button-element.js";

export type TransportRowLayout = "transport" | "transport-shift";

export class SequencerTransportRowElement extends LitElement {
  public static readonly tagName = "sequencer-transport-row";

  public static override properties = {
    layout: { type: String, reflect: true },
    buttonWidth: { type: Number, attribute: "button-width" },
    buttonHeight: { type: Number, attribute: "button-height" },
    gap: { type: Number },
  } as const;

  declare public layout: TransportRowLayout;
  declare public buttonWidth: number;
  declare public buttonHeight: number;
  declare public gap: number;

  public constructor() {
    super();
    this.layout = "transport";
    this.buttonWidth = 88;
    this.buttonHeight = 56;
    this.gap = 8;
  }

  public override render() {
    return html`
      <div
        class="row"
        role="group"
        aria-label="Transport controls"
        style=${styleMap({
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "min-content",
          alignItems: "center",
          gap: `${this.gap}px`,
        })}
      >
        <sequencer-transport-button
          variant="stop"
          label="sync"
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
        ></sequencer-transport-button>

        <sequencer-transport-button
          variant="record"
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
        ></sequencer-transport-button>

        <sequencer-transport-button
          variant="play"
          label="tap"
          .width=${this.buttonWidth}
          .height=${this.buttonHeight}
        ></sequencer-transport-button>

        ${this.layout === "transport-shift"
          ? html`
              <sequencer-shift-button
                .width=${this.buttonWidth}
                .height=${this.buttonHeight}
              ></sequencer-shift-button>
            `
          : ""}
      </div>
    `;
  }
}

if (!customElements.get(SequencerTransportRowElement.tagName)) {
  customElements.define(
    SequencerTransportRowElement.tagName,
    SequencerTransportRowElement,
  );
}
