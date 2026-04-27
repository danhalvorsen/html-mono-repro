import type { MidiMessage } from "../model/MidiMessage.js";
import type { MidiSongId } from "../model/MidiSong.js";

export interface MidiStreamMessage {
  readonly songId: MidiSongId;
  readonly eventIndex: number;
  readonly tick: number;
  readonly delayMs: number;
  readonly message: MidiMessage;
}

export interface MidiStreamCompleted {
  readonly songId: MidiSongId;
  readonly eventCount: number;
}

export interface MidiStreamFailure {
  readonly songId: MidiSongId;
  readonly message: string;
}

export interface IMidiStreamSink {
  send(event: MidiStreamMessage): void;
  complete(event: MidiStreamCompleted): void;
  fail(error: MidiStreamFailure): void;
}