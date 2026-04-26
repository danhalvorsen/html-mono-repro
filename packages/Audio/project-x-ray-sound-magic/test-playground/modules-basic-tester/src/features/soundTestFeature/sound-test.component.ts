// FILE: src/features/soundTestFeature/sound-test.component.ts

import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import type { IBasicOscillatorDefinition, OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { DefaultTwoOscillatorVoiceDefinitionFactory } from "./DefaultTwoOscillatorVoiceDefinition.js";
import {
  LondonBridgeMelodyFactory,
  MelodyVoicePlayer,
  type IMelodyPlaybackHandle,
} from "./MelodyVoicePlayer.js";
import { SoundTestCompositionRoot } from "./SoundTestCompositionRoot.js";
import type {
  IOscillatorVoiceSlotDefinition,
  ITwoOscillatorVoice,
  ITwoOscillatorVoiceDefinition,
  ITwoOscillatorVoiceFactory,
} from "./TwoOscillatorVoice.js";

type OscillatorSlotIndex = 0 | 1;

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly noteFrequencyHz = 261.6255653005986;
  private readonly melodyPlayer = new MelodyVoicePlayer();

  private audioContext: AudioContext | null = null;
  private voiceFactory: ITwoOscillatorVoiceFactory | null = null;
  private activeVoice: ITwoOscillatorVoice | null = null;
  private activeMelody: IMelodyPlaybackHandle | null = null;

  @state()
  private voiceDefinition: ITwoOscillatorVoiceDefinition =
    DefaultTwoOscillatorVoiceDefinitionFactory.create();

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 16px;
      max-width: 760px;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }

    h1 {
      margin: 0;
    }

    .toolbar,
    .oscillators {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: start;
    }

    .oscillator,
    .envelope {
      display: grid;
      gap: 10px;
      min-width: 260px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
    }

    .row {
      display: grid;
      gap: 4px;
    }

    .inline {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    button,
    select,
    input {
      padding: 8px;
      font: inherit;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      padding: 0;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }
  `;

  protected override render() {
    return html`
      <section>
        <h1>Two Oscillator Sample</h1>

        <div class="toolbar">
          <button type="button" @click=${this.startNote}>Play C4</button>
          <button type="button" @click=${this.releaseNote}>Release</button>
          <button type="button" @click=${this.playLondonBridge}>Play London Bridge</button>
          <button type="button" @click=${this.stopMelody}>Stop Melody</button>
        </div>

        <div class="oscillators">
          ${this.renderOscillator(0, "Oscillator A")}
          ${this.renderOscillator(1, "Oscillator B")}
        </div>

        <div class="envelope">
          <strong>ADSR Envelope</strong>
          <span>
            Attack ${this.voiceDefinition.envelope.kind === "adsr"
              ? this.voiceDefinition.envelope.attackSeconds.toFixed(2)
              : "n/a"}s,
            Release ${this.voiceDefinition.envelope.kind === "adsr"
              ? this.voiceDefinition.envelope.releaseSeconds.toFixed(2)
              : "n/a"}s
          </span>
        </div>
      </section>
    `;
  }

  public override disconnectedCallback(): void {
    this.stopMelody();
    this.activeVoice?.dispose();
    this.activeVoice = null;

    void this.audioContext?.close();
    this.audioContext = null;
    this.voiceFactory = null;

    super.disconnectedCallback();
  }

  private renderOscillator(index: OscillatorSlotIndex, title: string) {
    const slot = this.voiceDefinition.oscillators[index];
    const oscillator = slot.definition;

    if (oscillator.kind !== OscillatorKind.Basic) {
      return html`
        <section class="oscillator">
          <strong>${title}</strong>

          <label class="inline">
            <input
              type="checkbox"
              .checked=${slot.enabled}
              @change=${(event: Event) => this.onEnabledChanged(event, index)}
            />
            Enabled
          </label>

          <span>Unsupported oscillator kind in this sample: ${oscillator.kind}</span>
        </section>
      `;
    }

    return html`
      <section class="oscillator">
        <strong>${title}</strong>

        <label class="inline">
          <input
            type="checkbox"
            .checked=${slot.enabled}
            @change=${(event: Event) => this.onEnabledChanged(event, index)}
          />
          Enabled
        </label>

        <div class="row">
          <label>Waveform</label>
          <select
            .disabled=${!slot.enabled}
            @change=${(event: Event) => this.onWaveformChanged(event, index)}
          >
            ${this.renderWaveformOption(oscillator, OscillatorWaveformKind.Sine, "Sine")}
            ${this.renderWaveformOption(oscillator, OscillatorWaveformKind.Square, "Square")}
            ${this.renderWaveformOption(oscillator, OscillatorWaveformKind.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(oscillator, OscillatorWaveformKind.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label>Gain: ${oscillator.gain.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            .disabled=${!slot.enabled}
            .value=${String(oscillator.gain)}
            @input=${(event: Event) => this.onGainChanged(event, index)}
          />
        </div>

        <div class="row">
          <label>Detune cents: ${oscillator.detuneCents}</label>
          <input
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .disabled=${!slot.enabled}
            .value=${String(oscillator.detuneCents)}
            @input=${(event: Event) => this.onDetuneChanged(event, index)}
          />
        </div>
      </section>
    `;
  }

  private renderWaveformOption(
    oscillator: IBasicOscillatorDefinition,
    waveform: IBasicOscillatorDefinition["waveform"],
    label: string,
  ) {
    return html`
      <option value=${waveform} ?selected=${oscillator.waveform === waveform}>
        ${label}
      </option>
    `;
  }

  private readonly startNote = async (): Promise<void> => {
    this.stopMelody();

    const context = await this.ensureAudioContext();
    const factory = this.ensureVoiceFactory(context);

    this.activeVoice?.dispose();

    const voice = factory.create({
      definition: this.voiceDefinition,
      destination: context.destination,
    });

    voice.gateOn({
      timeSeconds: context.currentTime,
      frequencyHz: this.noteFrequencyHz,
      velocity: 0.9,
    });

    this.activeVoice = voice;
  };

  private readonly releaseNote = (): void => {
    if (this.audioContext === null || this.activeVoice === null) {
      return;
    }

    this.activeVoice.gateOff({
      timeSeconds: this.audioContext.currentTime,
    });

    this.activeVoice = null;
  };

  private readonly playLondonBridge = async (): Promise<void> => {
    const context = await this.ensureAudioContext();
    const factory = this.ensureVoiceFactory(context);

    this.activeVoice?.dispose();
    this.activeVoice = null;

    this.stopMelody();

    this.activeMelody = this.melodyPlayer.play({
      context,
      voiceFactory: factory,
      voiceDefinition: this.voiceDefinition,
      destination: context.destination,
      melody: LondonBridgeMelodyFactory.create(),
      startTimeSeconds: context.currentTime + 0.03,
      velocity: 0.85,
    });
  };

  private readonly stopMelody = (): void => {
    this.activeMelody?.stop();
    this.activeMelody = null;
  };

  private async ensureAudioContext(): Promise<AudioContext> {
    if (this.audioContext === null) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  private ensureVoiceFactory(context: AudioContext): ITwoOscillatorVoiceFactory {
    if (this.voiceFactory === null) {
      this.voiceFactory = new SoundTestCompositionRoot(context)
        .createTwoOscillatorVoiceFactory();
    }

    return this.voiceFactory;
  }

  private onEnabledChanged(event: Event, index: OscillatorSlotIndex): void {
    const input = event.target as HTMLInputElement;

    this.patchOscillatorSlot(index, {
      enabled: input.checked,
    });
  }

  private onWaveformChanged(event: Event, index: OscillatorSlotIndex): void {
    const select = event.target as HTMLSelectElement;

    this.patchBasicOscillator(index, {
      waveform: select.value as IBasicOscillatorDefinition["waveform"],
    });
  }

  private onGainChanged(event: Event, index: OscillatorSlotIndex): void {
    const input = event.target as HTMLInputElement;

    this.patchBasicOscillator(index, {
      gain: Number(input.value),
    });
  }

  private onDetuneChanged(event: Event, index: OscillatorSlotIndex): void {
    const input = event.target as HTMLInputElement;

    this.patchBasicOscillator(index, {
      detuneCents: Number(input.value),
    });
  }

  private patchOscillatorSlot(
    index: OscillatorSlotIndex,
    patch: Partial<IOscillatorVoiceSlotDefinition>,
  ): void {
    const current = this.voiceDefinition.oscillators[index];

    const nextOscillators: [
      IOscillatorVoiceSlotDefinition,
      IOscillatorVoiceSlotDefinition,
    ] = [
      this.voiceDefinition.oscillators[0],
      this.voiceDefinition.oscillators[1],
    ];

    nextOscillators[index] = {
      ...current,
      ...patch,
    };

    this.voiceDefinition = {
      ...this.voiceDefinition,
      oscillators: nextOscillators,
    };
  }

  private patchBasicOscillator(
    index: OscillatorSlotIndex,
    patch: Partial<IBasicOscillatorDefinition>,
  ): void {
    const currentSlot = this.voiceDefinition.oscillators[index];
    const currentOscillator = currentSlot.definition;

    if (currentOscillator.kind !== OscillatorKind.Basic) {
      throw new Error(`Oscillator ${String(index)} is not a basic oscillator.`);
    }

    const nextOscillator: IBasicOscillatorDefinition = {
      ...currentOscillator,
      ...patch,
      kind: OscillatorKind.Basic,
    };

    const nextOscillators: [
      IOscillatorVoiceSlotDefinition,
      IOscillatorVoiceSlotDefinition,
    ] = [
      this.voiceDefinition.oscillators[0],
      this.voiceDefinition.oscillators[1],
    ];

    nextOscillators[index] = {
      ...currentSlot,
      definition: nextOscillator as OscillatorDefinition,
    };

    this.voiceDefinition = {
      ...this.voiceDefinition,
      oscillators: nextOscillators,
    };
  }
}