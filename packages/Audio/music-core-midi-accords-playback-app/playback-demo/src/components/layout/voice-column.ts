import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("voice-column")
export class VoiceColumn extends LitElement {
  protected render() {
    return html`<slot name="voice"></slot>`;
  }

  static styles = css`
    :host {
      flex: 0 0 auto;
      width: max-content;
      min-width: fit-content;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      scroll-snap-align: start;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-column": VoiceColumn;
  }
}
