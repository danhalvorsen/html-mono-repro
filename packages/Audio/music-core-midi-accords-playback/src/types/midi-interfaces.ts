import type { MidiLogicalEvent } from "./midi-event.types.js";

export interface Song {
  get(): string;
}

export interface IMidiEventEngine {
  play(song: Song): readonly MidiLogicalEvent[];
}
