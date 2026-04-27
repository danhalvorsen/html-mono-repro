import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-voice-contracts";

export const VoiceControlEvent = {
  DefinitionChanged: "voice-control-definition-changed",
} as const;

export interface IVoiceDefinitionChangedDetail {
  readonly definition: IVoiceDefinition;
}

@customElement("voice-control")
export class VoiceControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 12px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input {
      width: 100%;
    }
  `;

  protected override render() {
    if (this.definition === null) {
      return html`<p>No voice definition.</p>`;
    }

    return html`
      <section>
        <h2>Voice</h2>

        <div class="row">
          <label for="outputGain">
            Output gain: ${this.definition.outputGain.toFixed(2)}
          </label>
          <input
            id="outputGain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.outputGain)}
            @input=${this.onOutputGainChanged}
          />
        </div>

        <p>Layers: ${this.definition.layers.length}</p>

        <slot name="layers"></slot>
      </section>
    `;
  }

  private readonly onOutputGainChanged = (event: Event): void => {
    if (this.definition === null) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const outputGain = Number(input.value);

    if (!Number.isFinite(outputGain)) {
      return;
    }

    this.definition = {
      ...this.definition,
      outputGain,
    };

    this.dispatchEvent(
      new CustomEvent<IVoiceDefinitionChangedDetail>(
        VoiceControlEvent.DefinitionChanged,
        {
          bubbles: true,
          composed: true,
          detail: {
            definition: this.definition,
          },
        },
      ),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-control": VoiceControlComponent;
  }
}
