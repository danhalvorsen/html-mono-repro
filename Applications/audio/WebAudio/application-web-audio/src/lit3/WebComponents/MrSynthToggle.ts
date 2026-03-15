// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/MrSynthToggle.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("mr-synth-toggle")
export class MrSynthToggle extends LitElement {
  @property({ type: Boolean })
  public playing = false;

  public static override styles = css`
    :host {
      display: inline-block;
    }

    button {
      font-size: 1rem;
      padding: 0.7rem 1.4rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
      color: white;
    }

    button.off {
      background: #666;
    }

    button.on {
      background: #3aa675;
    }
  `;

  protected override render() {
    return html`
      <button
        class=${this.playing ? "on" : "off"}
        @click=${this.onClick}>
        ${this.playing ? "Playing" : "Stopped"}
      </button>
    `;
  }

  private readonly onClick = (): void => {
    this.dispatchEvent(
      new CustomEvent("toggle-requested", {
        bubbles: true,
        composed: true,
      }),
    );
  };
}