import { MidiParseError } from "../errors/midi-parse-error.js";
import type { MidiFileHeader } from "@monorepo/music-core-midi/accords-types";
import {
  MidiStatus,
  MidiChannelCommand,
} from "@monorepo/music-core-midi/accords-types";
import type { ParsedTrackEvent, ParsedChannelEvent } from "../utils/internal-types.js";
import { MidiByteReader } from "./midi-byte-reader.js";
import { MidiMessageDataLength } from "./message-data-length.js";

type ParsedMidiFile = {
  readonly header: MidiFileHeader;
  readonly events: readonly ParsedTrackEvent[];
};

export class StandardMidiFileParser {
  public parse(bytes: Uint8Array): ParsedMidiFile {
    const reader = new MidiByteReader(bytes);
    const header = this.readHeader(reader);
    const events: ParsedTrackEvent[] = [];

    for (let trackIndex = 0; trackIndex < header.trackCount; trackIndex++) {
      events.push(...this.readTrack(reader, trackIndex));
    }

    return {
      header,
      events,
    };
  }

  private readHeader(reader: MidiByteReader): MidiFileHeader {
    const chunkId = reader.readAscii(4);
    if (chunkId !== "MThd") {
      throw new MidiParseError("Invalid MIDI header: missing MThd chunk.");
    }

    const length = reader.readUint32();
    if (length < 6) {
      throw new MidiParseError("Invalid MIDI header: MThd length must be at least 6.");
    }

    const format = reader.readUint16();
    if (format !== 0 && format !== 1 && format !== 2) {
      throw new MidiParseError(`Invalid MIDI format: ${format}.`);
    }

    const trackCount = reader.readUint16();
    const divisionRaw = reader.readUint16();

    if (format === 0 && trackCount !== 1) {
      throw new MidiParseError("Invalid MIDI file: format 0 must contain exactly one track.");
    }

    if (trackCount < 1) {
      throw new MidiParseError("Invalid MIDI file: track count must be greater than zero.");
    }

    if (length > 6) {
      reader.skip(length - 6);
    }

    return {
      format,
      trackCount,
      division: this.parseDivision(divisionRaw),
    };
  }

  private parseDivision(raw: number): MidiFileHeader["division"] {
    const isSmpte = (raw & 0x8000) !== 0;

    if (!isSmpte) {
      const ticksPerQuarterNote = raw & 0x7fff;
      if (ticksPerQuarterNote <= 0) {
        throw new MidiParseError(
          "Invalid MIDI division: ticks per quarter note must be greater than zero.",
        );
      }

      return {
        kind: "ticks-per-quarter-note",
        ticksPerQuarterNote,
      };
    }

    const fpsByte = (raw >> 8) & 0xff;
    const ticksPerFrame = raw & 0xff;
    const signedFps = fpsByte > 127 ? fpsByte - 256 : fpsByte;
    const framesPerSecond = Math.abs(signedFps);

    if (![24, 25, 29, 30].includes(framesPerSecond)) {
      throw new MidiParseError(`Invalid MIDI SMPTE division frame rate: ${signedFps}.`);
    }

    if (ticksPerFrame <= 0) {
      throw new MidiParseError("Invalid MIDI SMPTE division: ticks per frame must be greater than zero.");
    }

    return {
      kind: "smpte",
      framesPerSecond,
      ticksPerFrame,
    };
  }

  private readTrack(reader: MidiByteReader, trackIndex: number): readonly ParsedTrackEvent[] {
    const chunkId = reader.readAscii(4);
    if (chunkId !== "MTrk") {
      throw new MidiParseError(`Invalid MIDI track ${trackIndex}: missing MTrk chunk.`);
    }

    const trackLength = reader.readUint32();
    const trackEnd = reader.position + trackLength;
    const events: ParsedTrackEvent[] = [];

    let absoluteTick = 0;
    let runningStatus: number | undefined;
    let sequence = 0;
    let hasEndOfTrack = false;

    while (reader.position < trackEnd) {
      const delta = reader.readVariableLengthQuantity(trackEnd);
      absoluteTick += delta;

      const eventStart = reader.position;
      const first = reader.readByteWithin(trackEnd);

      if (first === MidiStatus.Meta) {
        runningStatus = undefined;

        const metaType = reader.readByteWithin(trackEnd);
        const length = reader.readVariableLengthQuantity(trackEnd);
        const data = reader.readBytesWithin(length, trackEnd);
        const rawBytes = reader.slice(eventStart, reader.position);

        events.push({
          type: "meta",
          absoluteTick,
          trackIndex,
          sequence: sequence++,
          rawBytes,
          metaType,
          data,
        });

        if (metaType === 0x2f) {
          hasEndOfTrack = true;
          break;
        }

        continue;
      }

      if (first === MidiStatus.SysExStart || first === MidiStatus.SysExEscape) {
        runningStatus = undefined;

        const length = reader.readVariableLengthQuantity(trackEnd);
        const data = reader.readBytesWithin(length, trackEnd);
        const rawBytes = reader.slice(eventStart, reader.position);

        events.push({
          type: "sysex",
          absoluteTick,
          trackIndex,
          sequence: sequence++,
          rawBytes,
          status: first,
          data,
        });

        continue;
      }

      if (first >= 0x80 && first <= 0xef) {
        runningStatus = first;

        const dataLength = MidiMessageDataLength.channel(first);
        const data = reader.readBytesWithin(dataLength, trackEnd);
        const rawBytes = reader.slice(eventStart, reader.position);

        events.push(this.createChannelEvent(first, data, absoluteTick, trackIndex, sequence++, rawBytes));
        continue;
      }

      if (first >= 0xf1 && first <= 0xfe) {
        runningStatus = undefined;

        const dataLength = MidiMessageDataLength.system(first);
        const data = reader.readBytesWithin(dataLength, trackEnd);
        const rawBytes = reader.slice(eventStart, reader.position);

        events.push({
          type: "system",
          absoluteTick,
          trackIndex,
          sequence: sequence++,
          rawBytes,
          status: first,
          data,
        });

        continue;
      }

      if (first <= 0x7f) {
        if (runningStatus === undefined) {
          throw new MidiParseError(`Running status used before status byte in track ${trackIndex}.`);
        }

        const dataLength = MidiMessageDataLength.channel(runningStatus);
        const remainingData = reader.readBytesWithin(dataLength - 1, trackEnd);
        const data = [first, ...remainingData];
        const rawBytes = reader.slice(eventStart, reader.position);

        events.push(this.createChannelEvent(runningStatus, data, absoluteTick, trackIndex, sequence++, rawBytes));
        continue;
      }

      throw new MidiParseError(`Unsupported MIDI status byte 0x${first.toString(16)} in track ${trackIndex}.`);
    }

    if (reader.position > trackEnd) {
      throw new MidiParseError(`Invalid MIDI track ${trackIndex}: parser read beyond declared track length.`);
    }

    if (!hasEndOfTrack) {
      throw new MidiParseError(`Invalid MIDI track ${trackIndex}: missing End-of-Track meta event.`);
    }

    if (reader.position < trackEnd) {
      reader.seek(trackEnd);
    }

    return events;
  }

  private createChannelEvent(
    status: number,
    data: readonly number[],
    absoluteTick: number,
    trackIndex: number,
    sequence: number,
    rawBytes: readonly number[],
  ): ParsedChannelEvent {
    return {
      type: "channel",
      absoluteTick,
      trackIndex,
      sequence,
      rawBytes,
      status,
      command: status & 0xf0,
      channel: (status & 0x0f) + 1,
      data,
    };
  }
}
