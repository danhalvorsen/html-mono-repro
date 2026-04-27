// FILE: audio-function-midi-streamer-contracts/src/index.ts

export const MidiMessageKinds = {
  noteOn: "note-on",
  noteOff: "note-off",
  controlChange: "control-change",
  pitchBend: "pitch-bend",
  systemExclusive: "system-exclusive",
} as const;

export type MidiMessageKind =
  (typeof MidiMessageKinds)[keyof typeof MidiMessageKinds];

export const MidiStreamerDomEvents = {
  songsLoaded: "audio-function-midi-streamer:songs-loaded",
  songSelected: "audio-function-midi-streamer:song-selected",
  midiMessage: "audio-function-midi-streamer:midi-message",
  streamCompleted: "audio-function-midi-streamer:stream-completed",
  streamFailed: "audio-function-midi-streamer:stream-failed",
} as const;

export type MidiStreamerDomEventName =
  (typeof MidiStreamerDomEvents)[keyof typeof MidiStreamerDomEvents];

export type MidiByte = number;
export type MidiChannel = number;
export type MidiControllerNumber = number;
export type MidiNoteNumber = number;
export type MidiSongId = string;
export type MidiTick = number;
export type MidiVelocity = number;

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

export interface MidiStreamSubscription {
  cancel(): void;
}

export interface IMidiStreamScheduler {
  schedule(delayMs: number, action: () => void): MidiStreamSubscription;
}

export interface MidiStreamMessage {
  readonly songId: MidiSongId;
  readonly eventIndex: number;
  readonly tick: MidiTick;
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

export interface IMidiSongStreamer {
  stream(song: MidiSong, sink: IMidiStreamSink): MidiStreamSubscription;
}