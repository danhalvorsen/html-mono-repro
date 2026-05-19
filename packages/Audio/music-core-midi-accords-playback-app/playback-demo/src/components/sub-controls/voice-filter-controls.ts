import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { VoiceFilterConfig, VoiceFilterType } from "../../audio/IVoiceSource.js";

export type VoiceFilterControlsValue = VoiceFilterConfig;

export const VoiceFilterControlsEventName = Object.freeze({
  Changed: "voice-filter-controls-changed",
} as const);

@customElement("voice-filter-controls")
export class VoiceFilterControls extends LitElement {
  @property({ type: Boolean })
  public enabled = true;

  @property({ type: String })
  public type: VoiceFilterType = "lowpass";

  @property({ type: Number })
  public frequency = 1200;

  @property({ type: Number })
  public q = 1;

  protected render() {
    return html`
      <fieldset>
        <legend><slot name="legend">Filter</slot></legend>
        <label class="row">
          <input
            type="checkbox"
            .checked=${this.enabled}
            @change=${(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              this.enabled = target.checked;
              this.emitChanged();
            }}
          />
          <span><slot name="enabled-label">Enabled</slot></span>
        </label>

        <label class="row">
          <span><slot name="type-label">Type</slot></span>
          <select
            .value=${this.type}
            @change=${(event: Event) => {
              const target = event.currentTarget as HTMLSelectElement;
              this.type = target.value as VoiceFilterType;
              this.emitChanged();
            }}
          >
            <option value="lowpass">LP</option>
            <option value="bandpass">BP</option>
            <option value="highpass">HP</option>
          </select>
        </label>

        <label class="row">
          <span><slot name="frequency-label">Frequency</slot>: ${Math.round(this.frequency)} Hz</span>
          <input
            type="range"
            min="50"
            max="12000"
            .value=${String(this.frequency)}
            @input=${(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              this.frequency = Number.parseFloat(target.value);
              this.emitChanged();
            }}
          />
        </label>

        <label class="row">
          <span><slot name="q-label">Q</slot>: ${this.q.toFixed(2)}</span>
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            .value=${String(this.q)}
            @input=${(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              this.q = Number.parseFloat(target.value);
              this.emitChanged();
            }}
          />
        </label>
      </fieldset>
    `;
  }

  public getValue(): VoiceFilterControlsValue {
    return {
      enabled: this.enabled,
      type: this.type,
      frequency: this.frequency,
      q: this.q,
    };
  }

  private emitChanged(): void {
    this.dispatchEvent(
      new CustomEvent<VoiceFilterControlsValue>(VoiceFilterControlsEventName.Changed, {
        detail: this.getValue(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = css`
    :host {
      display: block;
    }

    fieldset {
      margin: 0;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #2b3a5d;
      background: #10182a;
    }

    legend {
      padding: 0 6px;
      color: #b8c8ec;
      font-size: 12px;
    }

    .row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
      font-size: 12px;
      color: #a7b5d8;
    }

    .row:last-child {
      margin-bottom: 0;
    }

    select {
      background: #172543;
      color: #dce8ff;
      border: 1px solid #365186;
      border-radius: 6px;
      padding: 6px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-filter-controls": VoiceFilterControls;
  }
}
