// src/features/components/Panel/Cards/DummyWebCard1.ts
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

export const DUMMY_WEB_CARD_1_TAG = "mr-dummy-web-card-1" as const;

@customElement(DUMMY_WEB_CARD_1_TAG)
export class DummyWebCard1 extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 2px solid red;
      padding: 8px;
      background: #222;
      color: white;
    }
  `;

  render() {
    return html`<div>DUMMY WEB CARD 1 ✅</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-dummy-web-card-1": DummyWebCard1;
  }
}