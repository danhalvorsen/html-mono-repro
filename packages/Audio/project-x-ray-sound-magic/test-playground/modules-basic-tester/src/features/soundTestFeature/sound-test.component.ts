// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import type { MidiMessage } from "@monorepo/music-core-midi";

const MidiMessageStatus = {
  NoteOff: 0x80,
  NoteOn: 0x90,
} as const;

import { IOscillatorDefinition, OscillatorWaveform, type IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";

import "./midi-controller.component";
import "../../../../modules/music-core-synthesizer-oscillators-web-ui/src/oscillator-control.component";
import "./adsr-control.component";
import "./distortion-control.component";

import { SoundController } from "./SoundController.js";
import { createDefaultVoiceDefinition } from "./voice.factory";

const c4MidiNote = 60;
const repeatIntervalMilliseconds = 250;
const noteGateMilliseconds = 120;

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();

  private voiceDefinition: IVoiceDefinition = createDefaultVoiceDefinition();
  private repeatTimerId: number | undefined;
  private readonly noteOffTimerIds = new Set<number>();

  @state()
  private isPlaying = false;

  public disconnectedCallback(): void {
    this.stopRepeating();
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <h1>Sound Test</h1>

      <oscillator-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></oscillator-control>

      <adsr-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></adsr-control>

      <distortion-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></distortion-control>

      <button
        class=${this.isPlaying ? "active" : ""}
        type="button"
        @click=${this.onToggleC4}
      >
        ${this.isPlaying ? "Stop C4" : "Start C4"}
      </button>

      <button type="button" @click=${this.onStop}>Stop</button>

      <midi-controller @midi-message=${this.onMidiMessage}></midi-controller>
    `;
  }
private onOscillatorChanged(
  index: number,
  event: CustomEvent<{ readonly oscillator: IOscillatorDefinition }>,
): void {
  const oscillators = [...this.voiceDefinition.oscillators];
  oscillators[index] = event.detail.oscillator;

  this.setVoiceDefinition({
    ...this.voiceDefinition,
    oscillators,
  });
}

private onAddOscillator = (): void => {
  this.setVoiceDefinition({
    ...this.voiceDefinition,
    oscillators: [
      ...this.voiceDefinition.oscillators,
      {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.5,
      },
    ],
  });
};

private setVoiceDefinition(definition: IVoiceDefinition): void {
  this.voiceDefinition = definition;
  this.controller.setVoiceDefinition(definition);
  this.requestUpdate();
}
  private readonly onVoiceDefinitionChanged = (
    event: CustomEvent<{ readonly definition: IVoiceDefinition }>,
  ): void => {
    this.voiceDefinition = event.detail.definition;
    this.controller.setVoiceDefinition(this.voiceDefinition);
    this.requestUpdate();
  };

  private readonly onToggleC4 = (): void => {
    if (this.isPlaying) {
      this.stopRepeating();
      return;
    }

    void this.startRepeating();
  };

  private readonly onStop = (): void => {
    this.stopRepeating();
  };

  private readonly onMidiMessage = async (
    event: CustomEvent<{ readonly message: MidiMessage }>,
  ): Promise<void> => {
    await this.controller.init(this.voiceDefinition);

    const message = event.detail.message;

    switch (message.status) {
      case MidiMessageStatus.NoteOn:
        this.controller.noteOn(message.note.value());
        return;

      case MidiMessageStatus.NoteOff:
        this.controller.noteOff(message.note.value());
        return;
    }
  };

  private async startRepeating(): Promise<void> {
    if (this.repeatTimerId !== undefined) {
      return;
    }

    this.isPlaying = true;

    await this.controller.init(this.voiceDefinition);

    if (!this.isPlaying) {
      return;
    }

    this.playC4Pulse();

    this.repeatTimerId = window.setInterval(() => {
      this.playC4Pulse();
    }, repeatIntervalMilliseconds);
  }

  private stopRepeating(): void {
    if (this.repeatTimerId !== undefined) {
      window.clearInterval(this.repeatTimerId);
      this.repeatTimerId = undefined;
    }

    for (const timerId of this.noteOffTimerIds) {
      window.clearTimeout(timerId);
    }

    this.noteOffTimerIds.clear();
    this.controller.noteOff(c4MidiNote);
    this.isPlaying = false;
  }

  private playC4Pulse(): void {
    this.controller.noteOff(c4MidiNote);
    this.controller.noteOn(c4MidiNote);

    const timerId = window.setTimeout(() => {
      this.noteOffTimerIds.delete(timerId);
      this.controller.noteOff(c4MidiNote);
    }, noteGateMilliseconds);

    this.noteOffTimerIds.add(timerId);
  }

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }

    button.active {
      border-color: #aa3bff;
      background: #aa3bff22;
      color: #aa3bff;
    }

    oscillator-control,
    midi-controller {
      display: block;
      margin-bottom: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "sound-test": SoundTestComponent;
  }
}
