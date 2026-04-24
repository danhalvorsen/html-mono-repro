// FILE: packages/Audio/music-core-midi/src/mid2Txt.ts

export interface MidiDivisionTpqn {
  readonly type: "tpqn";
  readonly ticksPerQuarter: number;
}

export interface MidiDivisionSmpte {
  readonly type: "smpte";
  readonly fps: number;
  readonly ticksPerFrame: number;
}

export type MidiDivision = MidiDivisionTpqn | MidiDivisionSmpte;

export interface MidiHeader {
  readonly format: 0 | 1 | 2;
  readonly tracks: number;
  readonly division: MidiDivision;
}

export type MidiMetaEvent =
  | { readonly type: "sequenceNumber"; readonly number: number }
  | {
      readonly type: "text";
      readonly textType:
        | "text"
        | "copyright"
        | "trackName"
        | "instrumentName"
        | "lyric"
        | "marker"
        | "cuePoint";
      readonly text: string;
    }
  | { readonly type: "channelPrefix"; readonly channel: number }
  | { readonly type: "endOfTrack" }
  | { readonly type: "tempo"; readonly microsecondsPerQuarter: number }
  | {
      readonly type: "smpteOffset";
      readonly hr: number;
      readonly mn: number;
      readonly se: number;
      readonly fr: number;
      readonly ff: number;
    }
  | {
      readonly type: "timeSignature";
      readonly numerator: number;
      readonly denominator: number;
      readonly metronome: number;
      readonly thirtyseconds: number;
    }
  | { readonly type: "keySignature"; readonly sf: number; readonly mi: number }
  | { readonly type: "unknown"; readonly metaType: number; readonly data: Uint8Array };

type MidiTextMetaEvent = Extract<MidiMetaEvent, { readonly type: "text" }>;

export type MidiChannelEvent =
  | { readonly type: "noteOff"; readonly channel: number; readonly note: number; readonly velocity: number }
  | { readonly type: "noteOn"; readonly channel: number; readonly note: number; readonly velocity: number }
  | {
      readonly type: "polyAftertouch";
      readonly channel: number;
      readonly note: number;
      readonly pressure: number;
    }
  | {
      readonly type: "controlChange";
      readonly channel: number;
      readonly controller: number;
      readonly value: number;
    }
  | { readonly type: "programChange"; readonly channel: number; readonly program: number }
  | {
      readonly type: "channelAftertouch";
      readonly channel: number;
      readonly pressure: number;
    }
  | { readonly type: "pitchBend"; readonly channel: number; readonly value: number };

export type MidiSysExEvent =
  | { readonly type: "sysEx"; readonly data: Uint8Array }
  | { readonly type: "sysExEscape"; readonly data: Uint8Array };

export type MidiEvent =
  | { readonly deltaTime: number; readonly absoluteTime: number; readonly kind: "meta"; readonly meta: MidiMetaEvent }
  | {
      readonly deltaTime: number;
      readonly absoluteTime: number;
      readonly kind: "channel";
      readonly channel: MidiChannelEvent;
    }
  | { readonly deltaTime: number; readonly absoluteTime: number; readonly kind: "sysex"; readonly sysex: MidiSysExEvent };

export interface MidiTrack {
  readonly events: readonly MidiEvent[];
}

export interface MidiFile {
  readonly header: MidiHeader;
  readonly tracks: readonly MidiTrack[];
}

export interface MidiTextFormatter {
  formatHeader(header: MidiHeader): readonly string[];
  formatTrackHeader(trackIndex: number): readonly string[];
  formatEvent(event: MidiEvent, trackIndex: number): string | null;
}

export function midiToText(data: Uint8Array, formatter: MidiTextFormatter): string {
  if (!(data instanceof Uint8Array)) {
    throw new Error("midiToText: input must be Uint8Array");
  }

  const parser = new StandardMidiFileParser(data);
  const file = parser.parse();

  const lines: string[] = [];
  lines.push(...formatter.formatHeader(file.header));

  file.tracks.forEach((track, index) => {
    lines.push(...formatter.formatTrackHeader(index));
    for (const ev of track.events) {
      const line = formatter.formatEvent(ev, index);
      if (line !== null) {
        lines.push(line);
      }
    }
  });

  return lines.join("\n");
}

export class SimpleMidiTextFormatter implements MidiTextFormatter {
  formatHeader(header: MidiHeader): readonly string[] {
    const divisionText =
      header.division.type === "tpqn"
        ? `tpqn=${header.division.ticksPerQuarter}`
        : `smpte=${header.division.fps}fps/${header.division.ticksPerFrame}tpf`;

    return [
      `MIDI format=${header.format} tracks=${header.tracks} division=${divisionText}`,
    ];
  }

  formatTrackHeader(trackIndex: number): readonly string[] {
    return [``, `Track ${trackIndex}:`];
  }

  formatEvent(event: MidiEvent, _trackIndex: number): string | null {
    switch (event.kind) {
      case "meta":
        return this.formatMeta(event);
      case "channel":
        return this.formatChannel(event);
      case "sysex":
        return this.formatSysEx(event);
      default:
        return null;
    }
  }

  private formatMeta(event: Extract<MidiEvent, { kind: "meta" }>): string {
    const t = event.absoluteTime;
    const meta = event.meta;

    switch (meta.type) {
      case "sequenceNumber":
        return `${t}: META SequenceNumber ${meta.number}`;
      case "text":
        return `${t}: META ${meta.textType} "${meta.text}"`;
      case "channelPrefix":
        return `${t}: META ChannelPrefix ch=${meta.channel}`;
      case "endOfTrack":
        return `${t}: META EndOfTrack`;
      case "tempo": {
        const bpm = 60000000 / meta.microsecondsPerQuarter;
        return `${t}: META Tempo ${meta.microsecondsPerQuarter}us/q (${bpm.toFixed(2)} BPM)`;
      }
      case "smpteOffset":
        return `${t}: META SmpteOffset ${meta.hr}:${meta.mn}:${meta.se} fr=${meta.fr} ff=${meta.ff}`;
      case "timeSignature":
        return `${t}: META TimeSignature ${meta.numerator}/${meta.denominator} metro=${meta.metronome} 32nd=${meta.thirtyseconds}`;
      case "keySignature":
        return `${t}: META KeySignature sf=${meta.sf} mi=${meta.mi}`;
      case "unknown":
        return `${t}: META 0x${meta.metaType.toString(16)} len=${meta.data.length}`;
      default:
        return `${t}: META (unhandled)`;
    }
  }

  private formatChannel(event: Extract<MidiEvent, { kind: "channel" }>): string {
    const t = event.absoluteTime;
    const ch = event.channel;

    switch (ch.type) {
      case "noteOn":
        return `${t}: NoteOn ch=${ch.channel + 1} note=${ch.note} vel=${ch.velocity}`;
      case "noteOff":
        return `${t}: NoteOff ch=${ch.channel + 1} note=${ch.note} vel=${ch.velocity}`;
      case "polyAftertouch":
        return `${t}: PolyAftertouch ch=${ch.channel + 1} note=${ch.note} val=${ch.pressure}`;
      case "controlChange":
        return `${t}: CC ch=${ch.channel + 1} cc=${ch.controller} val=${ch.value}`;
      case "programChange":
        return `${t}: ProgramChange ch=${ch.channel + 1} prog=${ch.program}`;
      case "channelAftertouch":
        return `${t}: ChannelAftertouch ch=${ch.channel + 1} val=${ch.pressure}`;
      case "pitchBend":
        return `${t}: PitchBend ch=${ch.channel + 1} value=${ch.value}`;
      default:
        return `${t}: ChannelEvent (unhandled)`;
    }
  }

  private formatSysEx(event: Extract<MidiEvent, { kind: "sysex" }>): string {
    const t = event.absoluteTime;
    const sx = event.sysex;
    const kind = sx.type === "sysEx" ? "SysEx" : "SysExEscape";
    return `${t}: ${kind} len=${sx.data.length}`;
  }
}

class StandardMidiFileParser {
  private readonly data: Uint8Array;
  private offset = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  parse(): MidiFile {
    const header = this.parseHeader();
    const tracks: MidiTrack[] = [];

    for (let i = 0; i < header.tracks; i++) {
      tracks.push(this.parseTrack());
    }

    return { header, tracks };
  }

  private parseHeader(): MidiHeader {
    const id = this.readStr(4);
    if (id !== "MThd") {
      throw new Error("Invalid MIDI file: missing MThd header");
    }

    const length = this.readU32();
    if (length !== 6) {
      throw new Error(`Invalid MIDI header length: ${length}`);
    }

    const format = this.readU16();
    if (format < 0 || format > 2) {
      throw new Error(`Unsupported MIDI format: ${format}`);
    }

    const tracks = this.readU16();
    const divisionRaw = this.readU16();

    const division: MidiDivision =
      (divisionRaw & 0x8000) === 0
        ? { type: "tpqn", ticksPerQuarter: divisionRaw }
        : {
            type: "smpte",
            fps: -(divisionRaw >> 8),
            ticksPerFrame: divisionRaw & 0xff,
          };

    return {
      format: format as 0 | 1 | 2,
      tracks,
      division,
    };
  }

  private parseTrack(): MidiTrack {
    const id = this.readStr(4);
    if (id !== "MTrk") {
      throw new Error("Invalid MIDI file: missing MTrk chunk");
    }

    const length = this.readU32();
    const end = this.offset + length;

    const events: MidiEvent[] = [];
    let runningStatus = 0;
    let absoluteTime = 0;

    while (this.offset < end) {
      const delta = this.readVarLen();
      absoluteTime += delta;

      let status = this.readU8();
      if (status < 0x80) {
        if (runningStatus === 0) {
          throw new Error("Running status used before any status byte");
        }
        this.offset--;
        status = runningStatus;
      } else {
        runningStatus = status;
      }

      if (status === 0xff) {
        const metaEvent = this.parseMetaEvent(delta, absoluteTime);
        events.push(metaEvent);
        if (metaEvent.meta.type === "endOfTrack") {
          // consume remaining bytes if any, but stop interpreting
          this.offset = end;
          break;
        }
      } else if (status === 0xf0 || status === 0xf7) {
        events.push(this.parseSysExEvent(delta, absoluteTime, status));
      } else if ((status & 0xf0) >= 0x80 && (status & 0xf0) <= 0xe0) {
        events.push(this.parseChannelEvent(delta, absoluteTime, status));
      } else {
        throw new Error(`Unknown status byte: 0x${status.toString(16)}`);
      }
    }

    if (this.offset !== end) {
      // hard fail on length mismatch to keep behavior deterministic
      this.offset = end;
      throw new Error("Track length mismatch or malformed track data");
    }

    return { events };
  }

  private parseMetaEvent(
    delta: number,
    absoluteTime: number,
  ): Extract<MidiEvent, { readonly kind: "meta" }> {
    const type = this.readU8();
    const length = this.readVarLen();
    const bytes = this.readBytes(length);

    const makeText = (
      textType: MidiTextMetaEvent["textType"],
    ): MidiMetaEvent => ({
      type: "text",
      textType,
      text: String.fromCharCode(...bytes),
    });

    let meta: MidiMetaEvent;

    switch (type) {
      case 0x00: {
        const number =
          bytes.length >= 2 ? (((bytes[0] ?? 0) << 8) | (bytes[1] ?? 0)) : 0;
        meta = { type: "sequenceNumber", number };
        break;
      }
      case 0x01:
        meta = makeText("text");
        break;
      case 0x02:
        meta = makeText("copyright");
        break;
      case 0x03:
        meta = makeText("trackName");
        break;
      case 0x04:
        meta = makeText("instrumentName");
        break;
      case 0x05:
        meta = makeText("lyric");
        break;
      case 0x06:
        meta = makeText("marker");
        break;
      case 0x07:
        meta = makeText("cuePoint");
        break;
      case 0x20: {
        const channel = bytes.length >= 1 ? ((bytes[0] ?? 0) & 0x0f) : 0;
        meta = { type: "channelPrefix", channel };
        break;
      }
      case 0x2f:
        meta = { type: "endOfTrack" };
        break;
      case 0x51: {
        const value =
          bytes.length === 3
            ? (((bytes[0] ?? 0) << 16) | ((bytes[1] ?? 0) << 8) | (bytes[2] ?? 0))
            : 500000;
        meta = { type: "tempo", microsecondsPerQuarter: value };
        break;
      }
      case 0x54:
        meta = {
          type: "smpteOffset",
          hr: bytes[0] ?? 0,
          mn: bytes[1] ?? 0,
          se: bytes[2] ?? 0,
          fr: bytes[3] ?? 0,
          ff: bytes[4] ?? 0,
        };
        break;
      case 0x58:
        meta = {
          type: "timeSignature",
          numerator: bytes[0] ?? 4,
          denominator: bytes[1] ? 1 << bytes[1] : 4,
          metronome: bytes[2] ?? 24,
          thirtyseconds: bytes[3] ?? 8,
        };
        break;
      case 0x59: {
        const sf = bytes.length >= 1 ? (((bytes[0] ?? 0) << 24) >> 24) : 0;
        const mi = bytes.length >= 2 ? (bytes[1] ?? 0) : 0;
        meta = { type: "keySignature", sf, mi };
        break;
      }
      default:
        meta = { type: "unknown", metaType: type, data: bytes };
        break;
    }

    return {
      deltaTime: delta,
      absoluteTime,
      kind: "meta",
      meta,
    };
  }

  private parseSysExEvent(
    delta: number,
    absoluteTime: number,
    status: number,
  ): MidiEvent {
    const length = this.readVarLen();
    const bytes = this.readBytes(length);
    const sysex: MidiSysExEvent =
      status === 0xf0
        ? { type: "sysEx", data: bytes }
        : { type: "sysExEscape", data: bytes };

    return {
      deltaTime: delta,
      absoluteTime,
      kind: "sysex",
      sysex,
    };
  }

  private parseChannelEvent(
    delta: number,
    absoluteTime: number,
    status: number,
  ): MidiEvent {
    const type = status & 0xf0;
    const channel = status & 0x0f;

    const read2 = (): [number, number] => [this.readU8(), this.readU8()];

    let channelEvent: MidiChannelEvent;

    switch (type) {
      case 0x80: {
        const [note, velocity] = read2();
        channelEvent = { type: "noteOff", channel, note, velocity };
        break;
      }
      case 0x90: {
        const [note, velocity] = read2();
        if (velocity === 0) {
          channelEvent = { type: "noteOff", channel, note, velocity: 0 };
        } else {
          channelEvent = { type: "noteOn", channel, note, velocity };
        }
        break;
      }
      case 0xa0: {
        const [note, pressure] = read2();
        channelEvent = {
          type: "polyAftertouch",
          channel,
          note,
          pressure,
        };
        break;
      }
      case 0xb0: {
        const [controller, value] = read2();
        channelEvent = {
          type: "controlChange",
          channel,
          controller,
          value,
        };
        break;
      }
      case 0xc0: {
        const program = this.readU8();
        channelEvent = { type: "programChange", channel, program };
        break;
      }
      case 0xd0: {
        const pressure = this.readU8();
        channelEvent = {
          type: "channelAftertouch",
          channel,
          pressure,
        };
        break;
      }
      case 0xe0: {
        const [lsb, msb] = read2();
        const value = ((msb << 7) | lsb) - 8192;
        channelEvent = { type: "pitchBend", channel, value };
        break;
      }
      default:
        throw new Error(`Unknown channel event status: 0x${status.toString(16)}`);
    }

    return {
      deltaTime: delta,
      absoluteTime,
      kind: "channel",
      channel: channelEvent,
    };
  }

  private readU8(): number {
    if (this.offset >= this.data.length) {
      throw new Error("Unexpected EOF while reading byte");
    }
    const value = this.data[this.offset];
    if (value === undefined) {
      throw new Error("Unexpected EOF while reading byte");
    }
    this.offset++;
    return value;
  }

  private readU16(): number {
    const hi = this.readU8();
    const lo = this.readU8();
    return (hi << 8) | lo;
  }

  private readU32(): number {
    const b1 = this.readU8();
    const b2 = this.readU8();
    const b3 = this.readU8();
    const b4 = this.readU8();
    return ((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) >>> 0;
  }

  private readStr(len: number): string {
    const bytes = this.readBytes(len);
    return String.fromCharCode(...bytes);
  }

  private readBytes(len: number): Uint8Array {
    if (len < 0) {
      throw new Error("Negative length read requested");
    }
    if (this.offset + len > this.data.length) {
      throw new Error("Unexpected EOF while reading bytes");
    }
    const slice = this.data.subarray(this.offset, this.offset + len);
    this.offset += len;
    return slice;
  }

  private readVarLen(): number {
    let value = 0;
    let count = 0;

    while (true) {
      const b = this.readU8();
      value = (value << 7) | (b & 0x7f);
      count++;
      if ((b & 0x80) === 0) {
        break;
      }
      if (count > 4) {
        throw new Error("Invalid VLQ: too many bytes");
      }
    }

    return value;
  }
}
