import { MidiStatus, type MidiMessage } from "@monorepo/music-core-midi";

export type NoteOnMidiMessage = Extract<
  MidiMessage,
  { readonly status: MidiStatus.NoteOn }
>;

export type NoteOffMidiMessage = Extract<
  MidiMessage,
  { readonly status: MidiStatus.NoteOff }
>;

export type NoteMidiMessage = NoteOnMidiMessage | NoteOffMidiMessage;
