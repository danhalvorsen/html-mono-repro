import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import type { MidiMessage } from "@monorepo/music-core-midi";

import "./oscillator-control.component.js";
import "./midi-controller.component.js";

import {
  SoundController,
  type ISoundControllerOscillatorState,
} from "./SoundController.js";

const MidiMessageStatus = {
  NoteOff: 0x80,
  NoteOn: 0x90,
} as const;

const c4MidiNote = 60;
const repeatIntervalMilliseconds = 250;
const noteGateMilliseconds = 120;

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();
  private readonly noteOffTimerIds = new Set<number>();

  private repeatTimerId: number | undefined;

  @state()
  private isPlaying = false;

  @state()
  private oscillatorState: ISoundControllerOscillatorState = {
    waveform: "sawtooth",
    gain: 0.35,
    detuneCents: 0,
  };

  public disconnectedCallback(): void {
    this.stopRepeating();
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <h1>Sound Test</h1>

      <oscillator-control
        .state=${this.oscillatorState}
        @oscillator-state-changed=${this.onOscillatorStateChanged}
      ></oscillator-control>

      <div class="controls">
        <button
          class=${this.isPlaying ? "active" : ""}
          type="button"
          @click=${this.onToggleC4}
        >
          ${this.isPlaying ? "Stop C4 Repeat" : "Start C4 Repeat"}
        </button>

        <button type="button" @click=${this.onStop}>
          Stop
        </button>
      </div>

      <midi-controller @midi-message=${this.onMidiMessage}></midi-controller>
    `;
  }

  private readonly onOscillatorStateChanged = (
    event: CustomEvent<{ readonly state: ISoundControllerOscillatorState }>,
  ): void => {
    this.oscillatorState = event.detail.state;
    this.controller.setOscillatorState(this.oscillatorState);
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
    this.stopRepeating();
    this.controller.setOscillatorState(this.oscillatorState);

    const message = event.detail.message;

    switch (message.status) {
      case MidiMessageStatus.NoteOn:
        await this.controller.init();
        this.controller.noteOn(message.note.value(), message.velocity.value() / 127);
        return;

      case MidiMessageStatus.NoteOff:
        this.controller.noteOff();
        return;
    }
  };

  private async startRepeating(): Promise<void> {
    if (this.repeatTimerId !== undefined) {
      return;
    }

    this.isPlaying = true;
    this.controller.setOscillatorState(this.oscillatorState);

    await this.controller.init();

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
    this.controller.noteOff();
    this.isPlaying = false;
  }

  private playC4Pulse(): void {
    this.controller.noteOff();
    this.controller.noteOn(c4MidiNote, 1);

    const timerId = window.setTimeout(() => {
      this.noteOffTimerIds.delete(timerId);
      this.controller.noteOff();
    }, noteGateMilliseconds);

    this.noteOffTimerIds.add(timerId);
  }

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }

    .controls {
      display: flex;
      gap: 8px;
      margin: 16px 0;
    }

    button {
      padding: 8px 12px;
      font-size: 14px;
      cursor: pointer;
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
