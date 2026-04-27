import { MidiMessageKinds } from "../constants/MidiMessageKinds.js";

export type MidiChannel = number;
export type MidiByte = number;
export type MidiNoteNumber = number;
export type MidiVelocity = number;
export type MidiControllerNumber = number;
export type MidiTick = number;

export type MidiMessage =
  | MidiNoteOnMessage
  | MidiNoteOffMessage
  | MidiControlChangeMessage
  | MidiPitchBendMessage
  | MidiSystemExclusiveMessage;

export interface MidiNoteOnMessage {
  readonly kind: typeof MidiMessageKinds.noteOn;
  readonly channel: MidiChannel;
  readonly note: MidiNoteNumber;
  readonly velocity: MidiVelocity;
}

export interface MidiNoteOffMessage {
  readonly kind: typeof MidiMessageKinds.noteOff;
  readonly channel: MidiChannel;
  readonly note: MidiNoteNumber;
  readonly velocity: MidiVelocity;
}

export interface MidiControlChangeMessage {
  readonly kind: typeof MidiMessageKinds.controlChange;
  readonly channel: MidiChannel;
  readonly controller: MidiControllerNumber;
  readonly value: MidiByte;
}

export interface MidiPitchBendMessage {
  readonly kind: typeof MidiMessageKinds.pitchBend;
  readonly channel: MidiChannel;
  readonly value: number;
}

export interface MidiSystemExclusiveMessage {
  readonly kind: typeof MidiMessageKinds.systemExclusive;
  readonly data: readonly MidiByte[];
}
