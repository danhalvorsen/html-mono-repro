import type { MidiMessage, MidiTick } from "./MidiMessage.js";

export type MidiSongId = string;

export interface MidiTimedMessage {
  readonly tick: MidiTick;
  readonly message: MidiMessage;
}

export interface MidiSong {
  readonly id: MidiSongId;
  readonly title: string;
  readonly tempoBpm: number;
  readonly ticksPerQuarterNote: number;
  readonly events: readonly MidiTimedMessage[];
}
