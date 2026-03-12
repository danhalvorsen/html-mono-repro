// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Styles/MrShapeStyle.ts

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("mr-style")
export class MrStyle extends LitElement {
  public static override styles = css`
    ::slotted(mr-edge-shape) {
      --shape-stroke: #60a5fa;
      --shape-stroke-width: 1.5;
      --handle-radius: 6;
      --handle-fill: #ffffff;
      --handle-stroke: #1f2937;
      --handle-stroke-width: 1;
    }

    ::slotted(mr-circle-shape) {
      --shape-fill: #ffffff;
      --shape-stroke: #1f2937;
      --shape-stroke-width: 1;
    }

    ::slotted(mr-rect) {
      --rect-fill: #4caf50;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-style": MrStyle;
  }
}