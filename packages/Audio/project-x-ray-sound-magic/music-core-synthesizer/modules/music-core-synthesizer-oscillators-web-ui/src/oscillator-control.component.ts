// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/oscillator-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform } from "@monorepo/music-core-synthesizer-contracts";

export const OscillatorControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type VoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
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

  protected override render() {
    if (!this.definition) {
      return html`<p>No voice definition.</p>`;
    }

    return html`
      <section>
        <h2>Oscillator</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(OscillatorWaveform.Sine, "Sine")}
            ${this.renderWaveformOption(OscillatorWaveform.Square, "Square")}
            ${this.renderWaveformOption(OscillatorWaveform.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(OscillatorWaveform.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.definition.oscillator.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.oscillator.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.definition.oscillator.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.definition.oscillator.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    `;
  }

  private renderWaveformOption(value: OscillatorWaveform, label: string) {
    return html`
      <option
        value=${value}
        ?selected=${this.definition?.oscillator.waveform === value}
      >
        ${label}
      </option>
    `;
  }

  private onWaveformChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    this.patchOscillator({
      waveform: select.value as OscillatorWaveform,
    });
  };

  private onGainChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      gain: Number(input.value),
    });
  };

  private onDetuneChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      detuneCents: Number(input.value),
    });
  };

  private patchOscillator(
    patch: Partial<IVoiceDefinition["oscillators"]>,
  ): void {
    if (!this.definition) {
      return;
    }

    const next: IVoiceDefinition = {
      ...this.definition,
      oscillators: {
        ...this.definition.oscillators,
        ...patch,
      },
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(OscillatorControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}