import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface AdsrControlsValue {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
}

export const AdsrControlsEventName = Object.freeze({
  Changed: "adsr-controls-changed",
} as const);

@customElement("adsr-controls")
export class AdsrControls extends LitElement {
  @property({ type: Number })
  public attack = 24;

  @property({ type: Number })
  public decay = 40;

  @property({ type: Number })
  public sustain = 89;

  @property({ type: Number })
  public release = 36;

  protected render() {
    return html`
      <fieldset>
        <legend>ADSR</legend>
        ${this.renderSlider("Attack (MIDI)", this.attack, 0, 127, 1, (value) => {
          this.attack = Math.round(value);
          this.emitChanged();
        })}
        ${this.renderSlider("Decay (MIDI)", this.decay, 0, 127, 1, (value) => {
          this.decay = Math.round(value);
          this.emitChanged();
        })}
        ${this.renderSlider("Sustain (MIDI)", this.sustain, 0, 127, 1, (value) => {
          this.sustain = Math.round(value);
          this.emitChanged();
        })}
        ${this.renderSlider("Release (MIDI)", this.release, 0, 127, 1, (value) => {
          this.release = Math.round(value);
          this.emitChanged();
        })}
      </fieldset>
    `;
  }

  public getValue(): AdsrControlsValue {
    return {
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
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
        <span>${label}: ${Math.round(value)}</span>
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

  private emitChanged(): void {
    console.log("[adsr-controls] emit", this.getValue());
    this.dispatchEvent(
      new CustomEvent<AdsrControlsValue>(AdsrControlsEventName.Changed, {
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "adsr-controls": AdsrControls;
  }
}
