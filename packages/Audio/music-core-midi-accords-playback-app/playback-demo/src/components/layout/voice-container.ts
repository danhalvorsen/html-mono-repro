import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../sub-controls/adsr-controls.js";
import "../sub-controls/audio-source-controls.js";
import "../sub-controls/voice-filter-controls.js";

@customElement("voice-container")
export class VoiceContainer extends LitElement {
  @property({ type: String })
  public title = "Voice";

  protected render() {
    return html`
      <section>
        <h2>${this.title}</h2>
        <div class="content">
          <slot name="source">
            <audio-source-controls></audio-source-controls>
          </slot>
          <slot name="adsr">
            <adsr-controls></adsr-controls>
          </slot>
          <slot name="filter">
            <voice-filter-controls></voice-filter-controls>
          </slot>
        </div>
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    section {
      border: 1px solid #d4def3;
      border-radius: 10px;
      padding: 12px;
      background: #fbfdff;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #1c2a4a;
    }

    .content {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr 1fr;
    }

    ::slotted([slot="source"]),
    ::slotted([slot="adsr"]) {
      grid-column: span 1;
    }

    ::slotted([slot="filter"]) {
      grid-column: 1 / -1;
    }

    @media (max-width: 700px) {
      .content {
        grid-template-columns: 1fr;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-container": VoiceContainer;
  }
}
