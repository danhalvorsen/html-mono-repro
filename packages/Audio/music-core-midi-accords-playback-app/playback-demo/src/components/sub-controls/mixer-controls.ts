import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface MixerControlsValue {
  readonly masterGain: number;
  readonly pan: number;
  readonly muted: boolean;
  readonly solo: boolean;
}

export const MixerControlsEventName = Object.freeze({
  Changed: "mixer-controls-changed",
} as const);

@customElement("mixer-controls")
export class MixerControls extends LitElement {
  @property({ type: Number })
  public masterGain = 1;

  @property({ type: Number })
  public pan = 0;

  @property({ type: Boolean })
  public muted = false;

  @property({ type: Boolean })
  public solo = false;

  protected render() {
    return html`
      <fieldset>
        <legend>Mixer</legend>
        ${this.renderSlider("Master Gain", this.masterGain, 0, 2, 0.01, (value) => {
          this.masterGain = value;
          this.emitChanged();
        })}
        ${this.renderSlider("Pan", this.pan, -1, 1, 0.01, (value) => {
          this.pan = value;
          this.emitChanged();
        })}
        <label class="row-inline">
          <input type="checkbox" .checked=${this.muted} @change=${this.onMutedChanged} />
          <span>Muted</span>
        </label>
        <label class="row-inline">
          <input type="checkbox" .checked=${this.solo} @change=${this.onSoloChanged} />
          <span>Solo</span>
        </label>
      </fieldset>
    `;
  }

  public getValue(): MixerControlsValue {
    return {
      masterGain: this.masterGain,
      pan: this.pan,
      muted: this.muted,
      solo: this.solo,
    };
  }

  private renderSlider(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
  ) {
    return html`
      <label class="row">
        <span>${label}: ${value.toFixed(2)}</span>
        <input
          type="range"
          min=${String(min)}
          max=${String(max)}
          step=${String(step)}
          .value=${String(value)}
          @input=${(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            onChange(Number.parseFloat(target.value));
          }}
        />
      </label>
    `;
  }

  private onMutedChanged = (event: Event): void => {
    const target = event.currentTarget as HTMLInputElement;
    this.muted = target.checked;
    this.emitChanged();
  };

  private onSoloChanged = (event: Event): void => {
    const target = event.currentTarget as HTMLInputElement;
    this.solo = target.checked;
    this.emitChanged();
  };

  private emitChanged(): void {
    this.dispatchEvent(
      new CustomEvent<MixerControlsValue>(MixerControlsEventName.Changed, {
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
    .row-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #a7b5d8;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "mixer-controls": MixerControls;
  }
}
