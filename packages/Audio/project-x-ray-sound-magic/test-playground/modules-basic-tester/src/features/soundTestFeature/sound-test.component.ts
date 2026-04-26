// FILE: src/features/soundTestFeature/sound-test.component.ts

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import "./two-oscillator-demo.component.js";

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      min-height: 100%;
      background: #0f1117;
      color: #f4f4f5;
    }
  `;

  public override render() {
    return html`
      <two-oscillator-demo></two-oscillator-demo>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sound-test": SoundTestComponent;
  }
}