// FILE: src/features/soundTestFeature/MelodyVoicePlayer.ts

import type {
  ITwoOscillatorVoice,
  ITwoOscillatorVoiceDefinition,
  ITwoOscillatorVoiceFactory,
} from "./TwoOscillatorVoice.js";

export interface IMelodyNote {
  readonly frequencyHz: number;
  readonly durationSeconds: number;
  readonly gapSeconds: number;
}

export interface IMelody {
  readonly notes: readonly IMelodyNote[];
}

export interface IMelodyPlaybackRequest {
  readonly context: AudioContext;
  readonly voiceFactory: ITwoOscillatorVoiceFactory;
  readonly voiceDefinition: ITwoOscillatorVoiceDefinition;
  readonly destination: AudioNode;
  readonly melody: IMelody;
  readonly startTimeSeconds: number;
  readonly velocity: number;
}

export interface IMelodyPlaybackHandle {
  stop(): void;
}

export class MelodyVoicePlayer {
  public play(request: IMelodyPlaybackRequest): IMelodyPlaybackHandle {
    const voices: ITwoOscillatorVoice[] = [];
    let cursorSeconds = request.startTimeSeconds;

    for (const note of request.melody.notes) {
      const voice = request.voiceFactory.create({
        definition: request.voiceDefinition,
        destination: request.destination,
      });

      voice.gateOn({
        timeSeconds: cursorSeconds,
        frequencyHz: note.frequencyHz,
        velocity: request.velocity,
      });

      voice.gateOff({
        timeSeconds: cursorSeconds + note.durationSeconds,
      });

      voices.push(voice);
      cursorSeconds += note.durationSeconds + note.gapSeconds;
    }

    return new MelodyPlaybackHandle(voices);
  }
}

class MelodyPlaybackHandle implements IMelodyPlaybackHandle {
  private isStopped = false;

  public constructor(private readonly voices: readonly ITwoOscillatorVoice[]) {}

  public stop(): void {
    if (this.isStopped) {
      return;
    }

    this.isStopped = true;

    for (const voice of this.voices) {
      voice.dispose();
    }
  }
}

export class LondonBridgeMelodyFactory {
  public static create(): IMelody {
    const quarter = 0.34;
    const half = quarter * 2;
    const gap = 0.035;

    return {
      notes: [
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
      ],
    };
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
): IMelodyNote {
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