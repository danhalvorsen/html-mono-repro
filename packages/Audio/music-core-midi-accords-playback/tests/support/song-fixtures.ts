import type { Song } from "../../src/midi-event-engine.js";

export class SongText {
  public get(): string {
    return "C4-h500-v92-ch1 C4-h500-v92-ch1 G4-h500-v92-ch1 G4-h500-v92-ch1 A4-h500-v92-ch1 A4-h500-v92-ch1 G4-h1000-v92-ch1 F4-h500-v88-ch1 F4-h500-v88-ch1 E4-h500-v88-ch1 E4-h500-v88-ch1 D4-h500-v88-ch1 D4-h500-v88-ch1 C4-h1000-v88-ch1";
  }
}

export class MidiBinarySongFromNotation implements Song {
  public constructor(private readonly source: SongText) {}

  public get(): string {
    return notationToMidiBinarySong(this.source.get());
  }
}

type ParsedNote = {
  readonly noteNumber: number;
  readonly durationMs: number;
  readonly velocity: number;
  readonly channel: number;
};

function notationToMidiBinarySong(notation: string): string {
  const notes = parseNotation(notation);
  const ticksPerQuarterNote = 480;
  const ticksPerMs = ticksPerQuarterNote / 500;
  const trackBytes: number[] = [];

  trackBytes.push(0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20);

  for (const note of notes) {
    const holdTicks = Math.max(0, Math.round(note.durationMs * ticksPerMs));
    const noteOnStatus = 0x90 | note.channel;
    const noteOffStatus = 0x80 | note.channel;
    trackBytes.push(0x00, noteOnStatus, note.noteNumber, note.velocity);
    trackBytes.push(...encodeVarLen(holdTicks), noteOffStatus, note.noteNumber, 0);
  }

  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  const headerChunk = [
    ...ascii("MThd"),
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    (ticksPerQuarterNote >> 8) & 0xff, ticksPerQuarterNote & 0xff,
  ];

  const trackLength = trackBytes.length;
  const trackChunk = [
    ...ascii("MTrk"),
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
    ...trackBytes,
  ];

  const bytes = new Uint8Array([...headerChunk, ...trackChunk]);
  return Array.from(bytes, (value) => String.fromCharCode(value)).join("");
}

function parseNotation(input: string): readonly ParsedNote[] {
  return input
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .map((token) => {
      const match = /^([A-G])([#b]?)(\d+)-h(\d+)-v(\d+)-ch(\d+)$/.exec(token);
      if (match === null) {
        throw new Error(`Invalid note token: ${token}`);
      }

      const [, letter, accidental, octaveText, durationText, velocityText, channelText] = match;
      const octave = Number.parseInt(octaveText!, 10);
      const durationMs = Number.parseInt(durationText!, 10);
      const velocity = Number.parseInt(velocityText!, 10);
      const channelOneBased = Number.parseInt(channelText!, 10);
      const channel = Math.max(0, Math.min(15, channelOneBased - 1));

      return {
        noteNumber: noteNameToMidi(letter!, accidental!, octave),
        durationMs,
        velocity: Math.max(0, Math.min(127, velocity)),
        channel,
      };
    });
}

function noteNameToMidi(letter: string, accidental: string, octave: number): number {
  const baseByLetter: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const accidentalOffset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (octave + 1) * 12 + baseByLetter[letter] + accidentalOffset;
}

function encodeVarLen(value: number): number[] {
  let buffer = value & 0x7f;
  const output: number[] = [];

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    output.push(buffer & 0xff);
    if ((buffer & 0x80) !== 0) {
      buffer >>= 8;
      continue;
    }
    break;
  }

  return output;
}

function ascii(value: string): number[] {
  return Array.from(value, (char) => char.charCodeAt(0) & 0xff);
}

export function buildEventReport(
  events: readonly {
    readonly kind: string;
    readonly timestampMs: number;
    readonly absoluteTick: number;
    readonly trackIndex: number;
    readonly sequence: number;
    readonly channel?: number;
    readonly noteNumber?: number;
    readonly velocity?: number;
    readonly durationMs?: number;
    readonly metaKind?: string;
  }[],
): string {
  const lines: string[] = ["MIDI Event Report", `totalEvents=${events.length}`, ""];

  events.forEach((event, index) => {
    lines.push(
      [
        `#${index}`,
        `kind=${event.kind}`,
        `t=${Math.round(event.timestampMs)}ms`,
        `tick=${event.absoluteTick}`,
        `track=${event.trackIndex}`,
        `seq=${event.sequence}`,
        event.channel !== undefined ? `ch=${event.channel + 1}` : undefined,
        event.noteNumber !== undefined ? `note=${event.noteNumber}` : undefined,
        event.velocity !== undefined ? `vel=${event.velocity}` : undefined,
        event.durationMs !== undefined ? `dur=${Math.round(event.durationMs)}ms` : undefined,
        event.metaKind !== undefined ? `meta=${event.metaKind}` : undefined,
      ]
        .filter((part) => part !== undefined)
        .join(" "),
    );
  });

  lines.push("");
  return lines.join("\n");
}
