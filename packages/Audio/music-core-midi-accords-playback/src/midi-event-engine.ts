export { MidiEventEngine } from "./engine/midi-event-engine.js";
export { MidiParseError } from "./errors/midi-parse-error.js";

export type { Song, IMidiEventEngine } from "@monorepo/music-core-midi/accords-types";
export type {
  MidiLogicalEvent,
  MidiBaseLogicalEvent,
  MidiMetaLogicalEvent,
  MidiSysExLogicalEvent,
  MidiSystemLogicalEvent,
  MidiChannelLogicalEvent,
  MidiNoteOnLogicalEvent,
  MidiNoteOffLogicalEvent,
} from "@monorepo/music-core-midi/accords-types";
export type { MidiFileHeader, MidiDivision } from "@monorepo/music-core-midi/accords-types";
export type { MidiTimeSignature, MidiKeySignature } from "@monorepo/music-core-midi/accords-types";

export {
  MidiLogicalEventKind,
  MidiChannelMessageKind,
  MidiMetaEventKind,
  MidiStatus,
  MidiChannelCommand,
  DefaultTempoMicrosecondsPerQuarterNote,
} from "@monorepo/music-core-midi/accords-types";
