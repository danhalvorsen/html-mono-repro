import type { MidiChannelCommand } from "@monorepo/music-core-midi/accords-types";

export type ParsedTrackEvent =
  | ParsedMetaEvent
  | ParsedSysExEvent
  | ParsedChannelEvent
  | ParsedSystemEvent;

export type ParsedBaseEvent = {
  readonly absoluteTick: number;
  readonly trackIndex: number;
  readonly sequence: number;
  readonly rawBytes: readonly number[];
};

export type ParsedMetaEvent = ParsedBaseEvent & {
  readonly type: "meta";
  readonly metaType: number;
  readonly data: readonly number[];
};

export type ParsedSysExEvent = ParsedBaseEvent & {
  readonly type: "sysex";
  readonly status: 0xf0 | 0xf7;
  readonly data: readonly number[];
};

export type ParsedSystemEvent = ParsedBaseEvent & {
  readonly type: "system";
  readonly status: number;
  readonly data: readonly number[];
};

export type ParsedChannelEvent = ParsedBaseEvent & {
  readonly type: "channel";
  readonly status: number;
  readonly command: number;
  readonly channel: number;
  readonly data: readonly number[];
};

export type TempoPoint = {
  readonly tick: number;
  readonly tempoMicrosecondsPerQuarterNote: number;
  readonly sequence: number;
};

export type OpenNote = {
  readonly event: Omit<
    import("@monorepo/music-core-midi/accords-types").MidiNoteOnLogicalEvent,
    "durationMs"
  >;
};

export type MutableNoteOn = Omit<
  import("@monorepo/music-core-midi/accords-types").MidiNoteOnLogicalEvent,
  "durationMs"
> & {
  durationMs?: number;
};
