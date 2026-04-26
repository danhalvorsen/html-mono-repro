// FILE: src/oscillator-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type {
  IBasicOscillatorDefinition,
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

const IncomingMidiEvent = {
  NoteOn: "midi-song-player-note-on",
  NoteOff: "midi-song-player-note-off",
} as const;

export const OscillatorControlEvent = {
  DefinitionChanged: "oscillator-control-definition-changed",
  MidiNoteOnReceived: "oscillator-control-midi-note-on-received",
  MidiNoteOffReceived: "oscillator-control-midi-note-off-received",
} as const;

export interface IOscillatorDefinitionChangedDetail {
  readonly definition: OscillatorDefinition;
}

export interface IOscillatorMidiNoteOnDetail {
  readonly channel: number;
  readonly midiNote: number;
  readonly frequencyHz: number;
  readonly velocity: number;
  readonly timeSeconds: number;
}

export interface IOscillatorMidiNoteOffDetail {
  readonly channel: number;
  readonly midiNote: number;
  readonly frequencyHz: number;
  readonly timeSeconds: number;
}

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ type: String })
  public label = "Oscillator";

  @property({ attribute: false })
  public definition: OscillatorDefinition | null = null;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener(
      IncomingMidiEvent.NoteOn,
      this.forwardMidiNoteOn as EventListener,
    );

    this.addEventListener(
      IncomingMidiEvent.NoteOff,
      this.forwardMidiNoteOff as EventListener,
    );
  }

  public override disconnectedCallback(): void {
    this.removeEventListener(
      IncomingMidiEvent.NoteOn,
      this.forwardMidiNoteOn as EventListener,
    );

    this.removeEventListener(
      IncomingMidiEvent.NoteOff,
      this.forwardMidiNoteOff as EventListener,
    );

    super.disconnectedCallback();
  }

  public static override readonly styles = css`
  :host {
    display: block;
    min-height: 100%;
    color: #f4f4f5;
    background: #0f1117;
    font-family: system-ui, sans-serif;
  }

  .layout {
    display: grid;
    gap: 16px;
    min-height: 100%;
    padding: 24px;
    border-radius: 12px;
    background: #0f1117;
  }

  h1 {
    margin: 0;
    color: #ffffff;
    font-size: 28px;
  }

  .toolbar,
  .controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  button {
    padding: 8px 12px;
    border: 1px solid #3f4454;
    border-radius: 8px;
    background: #1a1d29;
    color: #f4f4f5;
    font: inherit;
    cursor: pointer;
  }

  button:hover {
    background: #242838;
  }

  .status {
    padding: 8px 12px;
    border: 1px solid #3f4454;
    border-radius: 8px;
    background: #151823;
    color: #d4d4d8;
    font-size: 13px;
  }

  oscillator-control,
  midi-controller {
    color: #f4f4f5;
  }
`;

  protected override render() {
    if (this.definition === null) {
      return html`<p>No oscillator definition.</p>`;
    }

    if (this.definition.kind !== OscillatorKind.Basic) {
      return html`
        <section>
          <h2>${this.label}</h2>
          <p>Unsupported oscillator kind: ${this.definition.kind}</p>
        </section>
      `;
    }

    return html`
      <section>
        <h2>${this.label}</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(this.definition, OscillatorWaveformKind.Sine, "Sine")}
            ${this.renderWaveformOption(this.definition, OscillatorWaveformKind.Square, "Square")}
            ${this.renderWaveformOption(this.definition, OscillatorWaveformKind.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(this.definition, OscillatorWaveformKind.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.definition.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.definition.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.definition.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    `;
  }

  private renderWaveformOption(
    definition: IBasicOscillatorDefinition,
    waveform: IBasicOscillatorDefinition["waveform"],
    label: string,
  ) {
    return html`
      <option value=${waveform} ?selected=${definition.waveform === waveform}>
        ${label}
      </option>
    `;
  }

  private readonly onWaveformChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;

    this.patchBasicOscillator({
      waveform: select.value as IBasicOscillatorDefinition["waveform"],
    });
  };

  private readonly onGainChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patchBasicOscillator({
      gain: Number(input.value),
    });
  };

  private readonly onDetuneChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patchBasicOscillator({
      detuneCents: Number(input.value),
    });
  };

  private readonly forwardMidiNoteOn = (
    event: CustomEvent<IOscillatorMidiNoteOnDetail>,
  ): void => {
    this.dispatchEvent(
      new CustomEvent<IOscillatorMidiNoteOnDetail>(
        OscillatorControlEvent.MidiNoteOnReceived,
        {
          bubbles: true,
          composed: true,
          detail: event.detail,
        },
      ),
    );
  };

  private readonly forwardMidiNoteOff = (
    event: CustomEvent<IOscillatorMidiNoteOffDetail>,
  ): void => {
    this.dispatchEvent(
      new CustomEvent<IOscillatorMidiNoteOffDetail>(
        OscillatorControlEvent.MidiNoteOffReceived,
        {
          bubbles: true,
          composed: true,
          detail: event.detail,
        },
      ),
    );
  };

  private patchBasicOscillator(patch: Partial<IBasicOscillatorDefinition>): void {
    if (this.definition === null || this.definition.kind !== OscillatorKind.Basic) {
      return;
    }

    this.definition = {
      ...this.definition,
      ...patch,
      kind: OscillatorKind.Basic,
    };

    this.dispatchEvent(
      new CustomEvent<IOscillatorDefinitionChangedDetail>(
        OscillatorControlEvent.DefinitionChanged,
        {
          bubbles: true,
          composed: true,
          detail: {
            definition: this.definition,
          },
        },
      ),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oscillator-control": OscillatorControlComponent;
  }
}