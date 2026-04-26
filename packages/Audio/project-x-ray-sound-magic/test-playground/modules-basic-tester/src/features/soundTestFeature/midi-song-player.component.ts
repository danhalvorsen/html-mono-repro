// FILE: src/features/soundTestFeature/midi-song-player.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

export const MidiSongPlayerEvent = {
  NoteOn: "midi-song-player-note-on",
  NoteOff: "midi-song-player-note-off",
  Stop: "midi-song-player-stop",
} as const;

export interface IMidiSongDefinition {
  readonly title: string;
  readonly bpm: number;
  readonly tracks: readonly IMidiSongTrackDefinition[];
}

export interface IMidiSongTrackDefinition {
  readonly id: string;
  readonly channel: number;
  readonly notes: readonly IMidiSongNoteDefinition[];
}

export interface IMidiSongNoteDefinition {
  readonly midiNote: number;
  readonly startBeat: number;
  readonly durationBeats: number;
  readonly velocity: number;
}

export interface IMidiNoteOnDetail {
  readonly channel: number;
  readonly midiNote: number;
  readonly frequencyHz: number;
  readonly velocity: number;
  readonly timeSeconds: number;
}

export interface IMidiNoteOffDetail {
  readonly channel: number;
  readonly midiNote: number;
  readonly frequencyHz: number;
  readonly timeSeconds: number;
}

interface IScheduledHandle {
  readonly id: number;
}

@customElement("midi-song-player")
export class MidiSongPlayerComponent extends LitElement {
  @property({ attribute: false })
  public song: IMidiSongDefinition | null = null;

  @query("slot")
  private readonly oscillatorSlot!: HTMLSlotElement;

  private readonly scheduledHandles: IScheduledHandle[] = [];

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 12px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
    }

    .toolbar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 8px;
      font: inherit;
    }

    slot {
      display: grid;
      gap: 12px;
    }
  `;

  protected override render() {
    return html`
      <section>
        <div class="toolbar">
          <strong>${this.song?.title ?? "No song loaded"}</strong>
          <button type="button" @click=${this.play}>Play</button>
          <button type="button" @click=${this.stop}>Stop</button>
        </div>

        <slot name="oscillator"></slot>
      </section>
    `;
  }

  public override disconnectedCallback(): void {
    this.stop();
    super.disconnectedCallback();
  }

  private readonly play = (): void => {
    this.stop();

    if (this.song === null) {
      return;
    }

    const startedAtMilliseconds = performance.now();
    const secondsPerBeat = 60 / this.song.bpm;

    for (const track of this.song.tracks) {
      for (const note of track.notes) {
        const frequencyHz = MidiFrequencyMapper.toFrequencyHz(note.midiNote);
        const noteOnDelayMilliseconds = note.startBeat * secondsPerBeat * 1000;
        const noteOffDelayMilliseconds =
          (note.startBeat + note.durationBeats) * secondsPerBeat * 1000;

        this.schedule(noteOnDelayMilliseconds, () => {
          const timeSeconds =
            (startedAtMilliseconds + noteOnDelayMilliseconds) / 1000;

          this.dispatchToOscillators<IMidiNoteOnDetail>(
            MidiSongPlayerEvent.NoteOn,
            {
              channel: track.channel,
              midiNote: note.midiNote,
              frequencyHz,
              velocity: note.velocity,
              timeSeconds,
            },
          );
        });

        this.schedule(noteOffDelayMilliseconds, () => {
          const timeSeconds =
            (startedAtMilliseconds + noteOffDelayMilliseconds) / 1000;

          this.dispatchToOscillators<IMidiNoteOffDetail>(
            MidiSongPlayerEvent.NoteOff,
            {
              channel: track.channel,
              midiNote: note.midiNote,
              frequencyHz,
              timeSeconds,
            },
          );
        });
      }
    }
  };

  private readonly stop = (): void => {
    while (this.scheduledHandles.length > 0) {
      const handle = this.scheduledHandles.pop();

      if (handle !== undefined) {
        window.clearTimeout(handle.id);
      }
    }

    this.dispatchToOscillators(MidiSongPlayerEvent.Stop, {});
  };

  private schedule(delayMilliseconds: number, callback: () => void): void {
    const id = window.setTimeout(callback, Math.max(0, delayMilliseconds));

    this.scheduledHandles.push({ id });
  }

  private dispatchToOscillators<TDetail extends object>(
    eventName: string,
    detail: TDetail,
  ): void {
    const assignedElements = this.oscillatorSlot.assignedElements({
      flatten: true,
    });

    for (const element of assignedElements) {
      element.dispatchEvent(
        new CustomEvent<TDetail>(eventName, {
          bubbles: false,
          composed: false,
          detail,
        }),
      );
    }
  }
}

class MidiFrequencyMapper {
  public static toFrequencyHz(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "midi-song-player": MidiSongPlayerComponent;
  }
}