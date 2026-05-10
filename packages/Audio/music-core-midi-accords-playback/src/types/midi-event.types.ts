import type { MidiChannelMessageKind, MidiLogicalEventKind, MidiMetaEventKind } from "./midi-constants.js";
import type { MidiKeySignature, MidiTimeSignature } from "./midi-signature.types.js";

export type MidiLogicalEvent =
  | MidiMetaLogicalEvent
  | MidiSysExLogicalEvent
  | MidiNoteOnLogicalEvent
  | MidiNoteOffLogicalEvent
  | MidiChannelLogicalEvent
  | MidiSystemLogicalEvent;

export type MidiBaseLogicalEvent = {
  readonly kind: MidiLogicalEventKind;
  readonly absoluteTick: number;
  readonly timestampMs: number;
  readonly trackIndex: number;
  readonly sequence: number;
  readonly rawBytes: readonly number[];
};

export type MidiMetaLogicalEvent = MidiBaseLogicalEvent & {
  readonly kind: MidiLogicalEventKind.Meta;
  readonly metaType: number;
  readonly metaKind: MidiMetaEventKind;
  readonly data: readonly number[];
  readonly text?: string;
  readonly tempoMicrosecondsPerQuarterNote?: number;
  readonly timeSignature?: MidiTimeSignature;
  readonly keySignature?: MidiKeySignature;
};

export type MidiSysExLogicalEvent = MidiBaseLogicalEvent & {
  readonly kind: MidiLogicalEventKind.SysEx;
  readonly status: 0xf0 | 0xf7;
  readonly data: readonly number[];
};

export type MidiSystemLogicalEvent = MidiBaseLogicalEvent & {
  readonly kind: MidiLogicalEventKind.System;
  readonly status: number;
  readonly data: readonly number[];
};

export type MidiChannelLogicalEvent = MidiBaseLogicalEvent & {
  readonly kind: MidiLogicalEventKind.Channel;
  readonly messageKind: Exclude<
    MidiChannelMessageKind,
    MidiChannelMessageKind.NoteOn | MidiChannelMessageKind.NoteOff
  >;
  readonly status: number;
  readonly channel: number;
  readonly data1?: number;
  readonly data2?: number;
  readonly value?: number;
};

export type MidiNoteOnLogicalEvent = MidiBaseLogicalEvent & {
  readonly kind: MidiLogicalEventKind.NoteOn;
  readonly status: number;
  readonly channel: number;
  readonly noteNumber: number;
  readonly velocity: number;
  readonly durationMs: number;
};

export type MidiNoteOffLogicalEvent = MidiBaseLogicalEvent & {
  readonly kind: MidiLogicalEventKind.NoteOff;
  readonly status: number;
  readonly channel: number;
  readonly noteNumber: number;
  readonly velocity: number;
};
