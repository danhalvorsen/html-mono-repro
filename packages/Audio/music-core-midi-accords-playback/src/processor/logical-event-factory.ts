import { MidiParseError } from "../errors/midi-parse-error.js";
import {
  MidiLogicalEventKind,
  MidiChannelMessageKind,
  MidiMetaEventKind,
  MidiChannelCommand,
} from "@monorepo/music-core-midi/accords-types";
import type {
  MidiLogicalEvent,
  MidiMetaLogicalEvent,
  MidiChannelLogicalEvent,
} from "@monorepo/music-core-midi/accords-types";
import type { MidiTimeSignature, MidiKeySignature } from "@monorepo/music-core-midi/accords-types";
import type { ParsedTrackEvent, ParsedChannelEvent, ParsedMetaEvent, MutableNoteOn, OpenNote } from "../utils/internal-types.js";
import { MidiTextDecoder } from "../utils/text-decoder.js";
import { NoteKey } from "../utils/note-key.js";
import { TempoMap } from "./tempo-map.js";
import { StableEventSorter } from "./event-sorter.js";

export class MidiLogicalEventFactory {
  public static create(
    parsedEvents: readonly ParsedTrackEvent[],
    tempoMap: TempoMap,
  ): readonly MidiLogicalEvent[] {
    const events: MidiLogicalEvent[] = [];
    const openNotes = new Map<string, OpenNote[]>();
    const mutableNoteOns: MutableNoteOn[] = [];

    for (const parsed of StableEventSorter.sortParsed(parsedEvents)) {
      const timestampMs = tempoMap.timestampMsAtTick(parsed.absoluteTick);

      if (parsed.type === "meta") {
        events.push(this.createMeta(parsed, timestampMs));
        continue;
      }

      if (parsed.type === "sysex") {
        events.push({
          kind: MidiLogicalEventKind.SysEx,
          absoluteTick: parsed.absoluteTick,
          timestampMs,
          trackIndex: parsed.trackIndex,
          sequence: parsed.sequence,
          rawBytes: parsed.rawBytes,
          status: parsed.status,
          data: parsed.data,
        });
        continue;
      }

      if (parsed.type === "system") {
        events.push({
          kind: MidiLogicalEventKind.System,
          absoluteTick: parsed.absoluteTick,
          timestampMs,
          trackIndex: parsed.trackIndex,
          sequence: parsed.sequence,
          rawBytes: parsed.rawBytes,
          status: parsed.status,
          data: parsed.data,
        });
        continue;
      }

      const channelEvent = this.createChannelOrNote(parsed, timestampMs, openNotes, mutableNoteOns);
      if (channelEvent !== undefined) {
        events.push(channelEvent);
      }
    }

    const lastTimestampMs =
      events.length === 0 ? 0 : Math.max(...events.map((event) => event.timestampMs));

    for (const noteOn of mutableNoteOns) {
      if (noteOn.durationMs === undefined) {
        noteOn.durationMs = Math.max(0, lastTimestampMs - noteOn.timestampMs);
      }
    }

    return Object.freeze(
      StableEventSorter.sortLogical(
        events.map((event) => {
          if (event.kind !== MidiLogicalEventKind.NoteOn) {
            return event;
          }

          const mutable = event as MutableNoteOn;
          return Object.freeze({
            ...mutable,
            durationMs: mutable.durationMs ?? 0,
          });
        }),
      ),
    );
  }

  private static createMeta(parsed: ParsedMetaEvent, timestampMs: number): MidiMetaLogicalEvent {
    const base = {
      kind: MidiLogicalEventKind.Meta,
      absoluteTick: parsed.absoluteTick,
      timestampMs,
      trackIndex: parsed.trackIndex,
      sequence: parsed.sequence,
      rawBytes: parsed.rawBytes,
      metaType: parsed.metaType,
      data: parsed.data,
    } satisfies Omit<MidiMetaLogicalEvent, "metaKind">;

    if (parsed.metaType === 0x51) {
      return {
        ...base,
        metaKind: MidiMetaEventKind.SetTempo,
        tempoMicrosecondsPerQuarterNote:
          (parsed.data[0]! << 16) |
          (parsed.data[1]! << 8) |
          parsed.data[2]!,
      };
    }

    if (parsed.metaType === 0x58) {
      return {
        ...base,
        metaKind: MidiMetaEventKind.TimeSignature,
        timeSignature: {
          numerator: parsed.data[0] ?? 4,
          denominator: 2 ** (parsed.data[1] ?? 2),
          metronomeClick: parsed.data[2] ?? 24,
          thirtySecondNotesPerQuarter: parsed.data[3] ?? 8,
        } satisfies MidiTimeSignature,
      };
    }

    if (parsed.metaType === 0x59) {
      const accidentalsByte = parsed.data[0] ?? 0;
      const accidentals = accidentalsByte > 127 ? accidentalsByte - 256 : accidentalsByte;

      return {
        ...base,
        metaKind: MidiMetaEventKind.KeySignature,
        keySignature: {
          accidentals,
          scale: (parsed.data[1] ?? 0) === 1 ? "minor" : "major",
        } satisfies MidiKeySignature,
      };
    }

    if (parsed.metaType === 0x03) {
      return {
        ...base,
        metaKind: MidiMetaEventKind.TrackName,
        text: MidiTextDecoder.decode(parsed.data),
      };
    }

    if (parsed.metaType === 0x2f) {
      return {
        ...base,
        metaKind: MidiMetaEventKind.EndOfTrack,
      };
    }

    return {
      ...base,
      metaKind: MidiMetaEventKind.Unknown,
    };
  }

  private static createChannelOrNote(
    parsed: ParsedChannelEvent,
    timestampMs: number,
    openNotes: Map<string, OpenNote[]>,
    mutableNoteOns: MutableNoteOn[],
  ): MidiLogicalEvent | undefined {
    const data1 = parsed.data[0];
    const data2 = parsed.data[1];

    if (data1 === undefined) {
      throw new MidiParseError("Invalid channel message: missing first data byte.");
    }

    if (parsed.command === MidiChannelCommand.NoteOn && data2 !== undefined && data2 > 0) {
      const noteOn: MutableNoteOn = {
        kind: MidiLogicalEventKind.NoteOn,
        absoluteTick: parsed.absoluteTick,
        timestampMs,
        trackIndex: parsed.trackIndex,
        sequence: parsed.sequence,
        rawBytes: parsed.rawBytes,
        status: parsed.status,
        channel: parsed.channel,
        noteNumber: data1,
        velocity: data2,
      };

      mutableNoteOns.push(noteOn);

      const key = NoteKey.create(parsed.channel, data1);
      const queue = openNotes.get(key) ?? [];
      queue.push({ event: noteOn });
      openNotes.set(key, queue);

      return noteOn as MidiLogicalEvent;
    }

    if (
      parsed.command === MidiChannelCommand.NoteOff ||
      parsed.command === MidiChannelCommand.NoteOn
    ) {
      const velocity = data2 ?? 0;
      const key = NoteKey.create(parsed.channel, data1);
      const queue = openNotes.get(key);

      if (queue !== undefined && queue.length > 0) {
        const open = queue.shift()!;
        (open.event as MutableNoteOn).durationMs =
          Math.max(0, timestampMs - open.event.timestampMs);
      }

      return {
        kind: MidiLogicalEventKind.NoteOff,
        absoluteTick: parsed.absoluteTick,
        timestampMs,
        trackIndex: parsed.trackIndex,
        sequence: parsed.sequence,
        rawBytes: parsed.rawBytes,
        status: parsed.status,
        channel: parsed.channel,
        noteNumber: data1,
        velocity,
      };
    }

    if (parsed.command === MidiChannelCommand.PolyphonicKeyPressure) {
      return this.createOtherChannel(parsed, timestampMs, MidiChannelMessageKind.PolyphonicKeyPressure);
    }

    if (parsed.command === MidiChannelCommand.ControlChange) {
      return this.createOtherChannel(parsed, timestampMs, MidiChannelMessageKind.ControlChange);
    }

    if (parsed.command === MidiChannelCommand.ProgramChange) {
      return this.createOtherChannel(parsed, timestampMs, MidiChannelMessageKind.ProgramChange);
    }

    if (parsed.command === MidiChannelCommand.ChannelPressure) {
      return this.createOtherChannel(parsed, timestampMs, MidiChannelMessageKind.ChannelPressure);
    }

    if (parsed.command === MidiChannelCommand.PitchBend) {
      const lsb = parsed.data[0] ?? 0;
      const msb = parsed.data[1] ?? 0;

      return {
        ...this.createOtherChannel(parsed, timestampMs, MidiChannelMessageKind.PitchBend),
        value: (msb << 7) | lsb,
      };
    }

    return undefined;
  }

  private static createOtherChannel(
    parsed: ParsedChannelEvent,
    timestampMs: number,
    messageKind: MidiChannelLogicalEvent["messageKind"],
  ): MidiChannelLogicalEvent {
    const event: MidiChannelLogicalEvent = {
      kind: MidiLogicalEventKind.Channel,
      absoluteTick: parsed.absoluteTick,
      timestampMs,
      trackIndex: parsed.trackIndex,
      sequence: parsed.sequence,
      rawBytes: parsed.rawBytes,
      status: parsed.status,
      channel: parsed.channel,
      messageKind,
    };

    const data1 = parsed.data[0];
    if (data1 !== undefined) {
      (event as { data1?: number }).data1 = data1;
    }

    const data2 = parsed.data[1];
    if (data2 !== undefined) {
      (event as { data2?: number }).data2 = data2;
    }

    return event;
  }
}
