import { MidiEventEngine, type MidiLogicalEvent, type Song as MidiBinarySong } from "@monorepo/music-core-midi-accords-playback";
import { from, map, filter, toArray, firstValueFrom, type Observable } from "rxjs";
export * from "./hand-detection.js";

export class Song {
  public get(): string {
    return "C4-h500-v92-ch1 C4-h500-v92-ch1 G4-h500-v92-ch1 G4-h500-v92-ch1 A4-h500-v92-ch1 A4-h500-v92-ch1 G4-h1000-v92-ch1 F4-h500-v88-ch1 F4-h500-v88-ch1 E4-h500-v88-ch1 E4-h500-v88-ch1 D4-h500-v88-ch1 D4-h500-v88-ch1 C4-h1000-v88-ch1";
  }
}

export class Player {
  public play(song: Song): readonly MidiLogicalEvent[] {
    const converter = new Converter();
    return converter.convert(song);
  }
}

export class Converter {
  private readonly engine = new MidiEventEngine();

  public convert(song: Song): readonly MidiLogicalEvent[] {
    const midiSong = new NotationBinarySong(song.get());
    return this.engine.play(midiSong);
  }

  public async convertToNoteNotation(song: Song): Promise<string> {
    const events = this.convert(song);
    return firstValueFrom(noteNotationFromEvents$(from(events)));
  }

  public async convertToAbc(song: Song): Promise<string> {
    const events = this.convert(song);
    return firstValueFrom(abcFromEvents$(from(events)));
  }
}

class NotationBinarySong implements MidiBinarySong {
  public constructor(private readonly notation: string) {}

  public get(): string {
    return notationToMidiBinarySong(this.notation);
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
    trackBytes.push(0x00, 0x90 | note.channel, note.noteNumber, note.velocity);
    trackBytes.push(...encodeVarLen(holdTicks), 0x80 | note.channel, note.noteNumber, 0);
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
  const base = baseByLetter[letter];
  if (base === undefined) {
    throw new Error(`Unsupported note letter: ${letter}`);
  }
  const accidentalOffset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (octave + 1) * 12 + base + accidentalOffset;
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

function noteOnEventToToken(event: Extract<MidiLogicalEvent, { kind: "note-on" }>): string {
  const note = midiToNoteName(event.noteNumber);
  const durationMs = Math.round(event.durationMs);
  return `${note}-h${durationMs}-v${event.velocity}-ch${event.channel}`;
}

function noteOnEventToAbc(event: Extract<MidiLogicalEvent, { kind: "note-on" }>): string {
  const token = noteOnEventToAbcToken(event);
  return token.units === 1 ? token.pitch : `${token.pitch}${token.units}`;
}

function midiToNoteName(noteNumber: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
  const pitchClass = noteNumber % 12;
  const octave = Math.floor(noteNumber / 12) - 1;
  return `${names[pitchClass]}${octave}`;
}

function midiToAbcPitch(noteNumber: number): string {
  const semitoneToName = ["C", "^C", "D", "^D", "E", "F", "^F", "G", "^G", "A", "^A", "B"] as const;
  const semitone = noteNumber % 12;
  const octave = Math.floor(noteNumber / 12) - 1;
  const name = semitoneToName[semitone]!;

  if (octave < 4) {
    return `${name}${",".repeat(4 - octave)}`;
  }
  if (octave === 4) {
    return name;
  }

  const lowered = name.toLowerCase();
  if (octave === 5) {
    return lowered;
  }

  return `${lowered}${"'".repeat(octave - 5)}`;
}

function chunkEight<T>(items: readonly T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += 8) {
    result.push(items.slice(i, i + 8));
  }
  return result;
}

export function noteNotationFromEvents$(events$: Observable<MidiLogicalEvent>): Observable<string> {
  return events$.pipe(
    filter((event): event is Extract<MidiLogicalEvent, { kind: "note-on" }> => event.kind === "note-on"),
    map((event) => noteOnEventToToken(event)),
    toArray(),
    map((tokens) => tokens.join(" ")),
  );
}

export function abcFromEvents$(events$: Observable<MidiLogicalEvent>): Observable<string> {
  return events$.pipe(
    filter((event): event is Extract<MidiLogicalEvent, { kind: "note-on" }> => event.kind === "note-on"),
    map((event) => noteOnEventToAbcToken(event)),
    toArray(),
    map((tokens) => {
      const body = groupByBarUnits(tokens, 16)
        .map((part) =>
          part
            .map((token) => (token.units === 1 ? token.pitch : `${token.pitch}${token.units}`))
            .join(" "),
        )
        .join(" | ");
      return [
        "X:1",
        "T:Song",
        "M:4/4",
        "L:1/8",
        "Q:120",
        "K:C",
        `${body} |`,
      ].join("\n");
    }),
  );
}

type AbcNoteToken = {
  readonly pitch: string;
  readonly units: number;
};

function noteOnEventToAbcToken(event: Extract<MidiLogicalEvent, { kind: "note-on" }>): AbcNoteToken {
  return {
    pitch: midiToAbcPitch(event.noteNumber),
    units: Math.max(1, Math.round(event.durationMs / 250)),
  };
}

function groupByBarUnits(tokens: readonly AbcNoteToken[], unitsPerBar: number): AbcNoteToken[][] {
  const bars: AbcNoteToken[][] = [];
  let current: AbcNoteToken[] = [];
  let used = 0;

  for (const token of tokens) {
    if (used > 0 && used + token.units > unitsPerBar) {
      bars.push(current);
      current = [];
      used = 0;
    }

    current.push(token);
    used += token.units;

    if (used === unitsPerBar) {
      bars.push(current);
      current = [];
      used = 0;
    }
  }

  if (current.length > 0) {
    bars.push(current);
  }

  return bars;
}
