import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export type AudioSourceType = "wav" | "osc";
export type OscillatorShape = "sine" | "square" | "sawtooth" | "triangle";

export interface AudioSourceControlsValue {
  readonly type: AudioSourceType;
  readonly fileName: string;
  readonly file: File | null;
  readonly oscillator: OscillatorShape;
  readonly gain: number;
  readonly detuneCents: number;
  readonly playbackRate: number;
  readonly loop: boolean;
}

export const AudioSourceControlsEventName = Object.freeze({
  Changed: "audio-source-controls-changed",
} as const);

@customElement("audio-source-controls")
export class AudioSourceControls extends LitElement {
  @property({ type: String })
  public type: AudioSourceType = "osc";

  @property({ type: String })
  public fileName = "";

  @property({ type: String })
  public oscillator: OscillatorShape = "sine";
  @property({ type: Number })
  public gain = 1;
  @property({ type: Number })
  public detuneCents = 0;
  @property({ type: Number })
  public playbackRate = 1;
  @property({ type: Boolean })
  public loop = false;
  private selectedFile: File | null = null;

  protected render() {
    return html`
      <fieldset>
        <legend>Audio Source</legend>
        <label class="row">
          <span>Type</span>
          <select .value=${this.type} @change=${this.onTypeChange}>
            <option value="osc">Osc</option>
            <option value="wav">Wave file</option>
          </select>
        </label>

        ${this.type === "wav"
          ? html`
              <label class="row">
                <span>Wave file</span>
                <input type="file" accept=".wav,audio/wav,audio/wave" @change=${this.onFileChange} />
                <small>${this.fileName || "No file selected"}</small>
              </label>
              ${this.renderSlider("Playback rate", this.playbackRate, 0.25, 4, 0.01, (value) => {
                this.playbackRate = value;
                this.emitChanged();
              })}
              <label class="row-inline">
                <input
                  type="checkbox"
                  .checked=${this.loop}
                  @change=${(event: Event) => {
                    const target = event.currentTarget as HTMLInputElement;
                    this.loop = target.checked;
                    this.emitChanged();
                  }}
                />
                <span>Loop</span>
              </label>
            `
          : html`
              <label class="row">
                <span>Oscillator</span>
                <select .value=${this.oscillator} @change=${this.onOscChange}>
                  <option value="sine">sine</option>
                  <option value="square">square</option>
                  <option value="sawtooth">sawtooth</option>
                  <option value="triangle">triangle</option>
                </select>
              </label>
            `}

        ${this.renderSlider("Detune (cents)", this.detuneCents, -2400, 2400, 1, (value) => {
          this.detuneCents = value;
          this.emitChanged();
        })}
        ${this.renderSlider("Gain", this.gain, 0, 2, 0.01, (value) => {
          this.gain = value;
          this.emitChanged();
        })}
      </fieldset>
    `;
  }

  public getValue(): AudioSourceControlsValue {
    return {
      type: this.type,
      fileName: this.fileName,
      file: this.selectedFile,
      oscillator: this.oscillator,
      gain: this.gain,
      detuneCents: this.detuneCents,
      playbackRate: this.playbackRate,
      loop: this.loop,
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
    const safeValue = Number.isFinite(value) ? value : 0;
    return html`
      <label class="row">
        <span>${label}: ${safeValue.toFixed(2)}</span>
        <input
          type="range"
          min=${String(min)}
          max=${String(max)}
          step=${String(step)}
          .value=${String(safeValue)}
          @input=${(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            onChange(Number.parseFloat(target.value));
          }}
        />
      </label>
    `;
  }

  private onTypeChange = (event: Event): void => {
    const target = event.currentTarget as HTMLSelectElement;
    this.type = target.value as AudioSourceType;
    this.emitChanged();
  };

  private onFileChange = (event: Event): void => {
    const target = event.currentTarget as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
    this.fileName = this.selectedFile?.name ?? "";
    this.emitChanged();
  };

  private onOscChange = (event: Event): void => {
    const target = event.currentTarget as HTMLSelectElement;
    this.oscillator = target.value as OscillatorShape;
    this.emitChanged();
  };

  private emitChanged(): void {
    this.dispatchEvent(
      new CustomEvent<AudioSourceControlsValue>(AudioSourceControlsEventName.Changed, {
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
    .row-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 12px;
      color: #a7b5d8;
    }
    legend {
      padding: 0 6px;
      color: #b8c8ec;
      font-size: 12px;
    }
    select,
    input[type="file"] {
      border: 1px solid #365186;
      border-radius: 6px;
      padding: 6px;
      background: #172543;
      color: #dce8ff;
    }
    small {
      color: #9fb3df;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "audio-source-controls": AudioSourceControls;
  }
}
