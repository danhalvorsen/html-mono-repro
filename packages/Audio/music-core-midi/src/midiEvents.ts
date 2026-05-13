export type MidiChannelVoiceType =
  | "noteon"
  | "noteoff"
  | "poly-aftertouch"
  | "control-change"
  | "program-change"
  | "channel-aftertouch"
  | "pitch-bend";

export type MidiSystemType =
  | "system-exclusive"
  | "time-code-quarter-frame"
  | "song-position-pointer"
  | "song-select"
  | "tune-request"
  | "timing-clock"
  | "start"
  | "continue"
  | "stop"
  | "active-sensing"
  | "reset"
  | "unknown-system";

export type MidiEventType = MidiChannelVoiceType | MidiSystemType | "unknown";
export type MidiNonNoteEventType = Exclude<MidiEventType, "noteon" | "noteoff">;

type MidiParsedCommon = Readonly<{
  status: number;
  data: readonly number[];
  timestamp: number;
  channel: number | null;
}>;

export type MidiParsedNonNoteEvent = MidiParsedCommon & Readonly<{
  type: MidiNonNoteEventType;
}>;

export type MidiParsedNoteEvent = MidiParsedCommon & Readonly<{
  type: "noteon" | "noteoff";
  channel: number;
  midiNote: number;
  velocity: number;
  pitchClass: number;
  octave: number;
  columnIndex: number;
}>;

export type MidiParsedEvent = MidiParsedNonNoteEvent | MidiParsedNoteEvent;

export type MidiControllerOptions = Readonly<{
  channelFilter?: number;
  octaveWindow?: Readonly<{
    min: number;
    max: number;
  }>;
}>;