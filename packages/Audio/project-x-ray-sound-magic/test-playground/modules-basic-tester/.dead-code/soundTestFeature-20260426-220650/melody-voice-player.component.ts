import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

export const MelodyVoicePlayerEvent = {
  PlayRequested: "melody-voice-player-play-requested",
  StopRequested: "melody-voice-player-stop-requested",
} as const;

export interface IMelodyVoiceNote {
  readonly frequencyHz: number;
  readonly durationSeconds: number;
  readonly gapSeconds: number;
}

export interface IMelodyVoicePlayerPlayRequestedDetail {
  readonly notes: readonly IMelodyVoiceNote[];
  readonly velocity: number;
}

@customElement("melody-voice-player")
export class MelodyVoicePlayerComponent extends LitElement {
  public static override readonly styles = css`
    :host {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 8px;
      font: inherit;
    }
  `;

  protected override render() {
    return html`
      <button type="button" @click=${this.requestLondonBridgePlayback}>
        Play London Bridge
      </button>

      <button type="button" @click=${this.requestStop}>
        Stop Melody
      </button>
    `;
  }

  private readonly requestLondonBridgePlayback = (): void => {
    this.dispatchEvent(
      new CustomEvent<IMelodyVoicePlayerPlayRequestedDetail>(
        MelodyVoicePlayerEvent.PlayRequested,
        {
          bubbles: true,
          composed: true,
          detail: {
            velocity: 0.85,
            notes: LondonBridgeMelody.create(),
          },
        },
      ),
    );
  };

  private readonly requestStop = (): void => {
    this.dispatchEvent(
      new CustomEvent(MelodyVoicePlayerEvent.StopRequested, {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

class LondonBridgeMelody {
  public static create(): readonly IMelodyVoiceNote[] {
    const quarter = 0.34;
    const half = quarter * 2;
    const gap = 0.035;

    return [
      note(MidiNote.G4, quarter, gap),
      note(MidiNote.A4, quarter, gap),
      note(MidiNote.G4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.G4, half, gap),

      note(MidiNote.D4, quarter, gap),
      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, half, gap),

      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.G4, half, gap),

      note(MidiNote.G4, quarter, gap),
      note(MidiNote.A4, quarter, gap),
      note(MidiNote.G4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.G4, half, gap),

      note(MidiNote.D4, half, gap),
      note(MidiNote.G4, half, gap),
      note(MidiNote.E4, half, gap),
      note(MidiNote.C4, half, gap),
    ];
  }
}

const MidiNote = {
  C4: 60,
  D4: 62,
  E4: 64,
  F4: 65,
  G4: 67,
  A4: 69,
} as const;

function note(
  midiNoteNumber: number,
  durationSeconds: number,
  gapSeconds: number,
): IMelodyVoiceNote {
  return {
    frequencyHz: EqualTemperamentFrequency.fromMidiNoteNumber(midiNoteNumber),
    durationSeconds,
    gapSeconds,
  };
}

class EqualTemperamentFrequency {
  public static fromMidiNoteNumber(midiNoteNumber: number): number {
    return 440 * Math.pow(2, (midiNoteNumber - 69) / 12);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "melody-voice-player": MelodyVoicePlayerComponent;
  }
}
