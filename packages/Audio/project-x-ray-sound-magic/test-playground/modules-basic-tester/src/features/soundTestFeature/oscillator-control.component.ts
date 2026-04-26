import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  OscillatorWaveformKind,
  type OscillatorWaveformKind as OscillatorWaveformKindValue,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type { ISoundControllerOscillatorState } from "./SoundController.js";

export const OscillatorControlEvents = {
  changed: "oscillator-state-changed",
} as const;

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ attribute: false })
  public state: ISoundControllerOscillatorState = {
    waveform: OscillatorWaveformKind.Sawtooth,
    gain: 0.35,
    detuneCents: 0,
  };

  protected override render() {
    return html`
      <section>
        <h2>Oscillator</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(OscillatorWaveformKind.Sine, "Sine")}
            ${this.renderWaveformOption(OscillatorWaveformKind.Square, "Square")}
            ${this.renderWaveformOption(OscillatorWaveformKind.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(OscillatorWaveformKind.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.state.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.state.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.state.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.state.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    `;
  }

  private renderWaveformOption(
    value: OscillatorWaveformKindValue,
    label: string,
  ) {
    return html`
      <option
        value=${value}
        ?selected=${this.state.waveform === value}
      >
        ${label}
      </option>
    `;
  }

  private readonly onWaveformChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;

    this.patch({
      waveform: select.value as OscillatorWaveformKindValue,
    });
  };

  private readonly onGainChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patch({
      gain: Number(input.value),
    });
  };

  private readonly onDetuneChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patch({
      detuneCents: Number(input.value),
    });
  };

  private patch(patch: Partial<ISoundControllerOscillatorState>): void {
    this.state = {
      ...this.state,
      ...patch,
    };

    this.dispatchEvent(
      new CustomEvent(OscillatorControlEvents.changed, {
        detail: { state: this.state },
        bubbles: true,
        composed: true,
      }),
    );
  }

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    select,
    input {
      padding: 6px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "oscillator-control": OscillatorControlComponent;
  }
}
