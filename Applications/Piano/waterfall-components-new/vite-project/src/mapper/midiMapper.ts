import type { NoteSymbol } from "@monorepo/music-core-midi";
import { MidiEventEngine } from "../../../../../../packages/Audio/music-core-midi-accords-playback/dist/midi-event-engine.js";
import type { Waterfall } from "../component/Waterfall.ts";

type MidiBinarySong = {
  get(): string;
};

export class MidiMapper {
  private readonly waterfall: Waterfall;
  private readonly engine: MidiEventEngine;
  private readonly audio: WebAudioNotePlayer;
  private activeColumns: number[] = [];
  private activeNoteNumbers: number[] = [];

  public constructor(waterfall: Waterfall) {
    this.waterfall = waterfall;
    this.engine = new MidiEventEngine();
    this.audio = new WebAudioNotePlayer();
  }

  public start(notes: Array<NoteSymbol>): void {
    this.stop(true);

    const notation = notes
      .map((note) => `${note}4-h500-v92-ch1`)
      .join(" ");
    const song = new NotationBinarySong(notation);
    const events = this.engine.play(song);
    const chordNotes: number[] = [];
    const columns: number[] = [];

    for (const event of events) {
      if (event.kind !== "note-on") {
        continue;
      }

      const columnIndex = event.noteNumber % 12;
      this.waterfall.createGavityFallingObjectInColumn(columnIndex, 0);
      chordNotes.push(event.noteNumber);
      columns.push(columnIndex);
    }

    if (chordNotes.length > 0) {
      this.activeColumns = columns;
      this.activeNoteNumbers = chordNotes;
      this.audio.startChord(chordNotes);
    }
  }

  public update(heldMs: number): void {
    const hold = Math.max(0, Math.round(heldMs));
    for (const columnIndex of this.activeColumns) {
      this.waterfall.updateGavityFallingObjectHeightInColumn(columnIndex, hold);
    }
  }

  public stop(cancel: boolean, heldMs: number = 0): void {
    const hold = Math.max(0, Math.round(heldMs));
    this.audio.stopChord(this.activeNoteNumbers);

    for (const columnIndex of this.activeColumns) {
      if (cancel) {
        this.waterfall.cancelGavityFallingObjectInColumn(columnIndex);
      } else {
        this.waterfall.completeGavityFallingObjectInColumn(columnIndex, hold);
      }
    }

    this.activeColumns = [];
    this.activeNoteNumbers = [];
  }
}

class WebAudioNotePlayer {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private readonly activeByNoteNumber: Map<number, {
    readonly oscillator: OscillatorNode;
    readonly noteGain: GainNode;
  }> = new Map();

  public startChord(noteNumbers: readonly number[]): void {
    const context = this.ensureContext();
    if (context === null) {
      return;
    }

    if (context.state === "suspended") {
      void context.resume();
    }

    const gain = this.masterGain;
    if (gain === null) {
      return;
    }

    const now = context.currentTime;

    for (const noteNumber of noteNumbers) {
      if (this.activeByNoteNumber.has(noteNumber)) {
        continue;
      }

      const oscillator = context.createOscillator();
      const noteGain = context.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.value = midiToFrequency(noteNumber);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.2, now + 0.04);

      oscillator.connect(noteGain);
      noteGain.connect(gain);

      oscillator.start(now);
      this.activeByNoteNumber.set(noteNumber, { oscillator, noteGain });
    }
  }

  public stopChord(noteNumbers: readonly number[]): void {
    const context = this.context;
    if (context === null) {
      return;
    }

    const now = context.currentTime;
    for (const noteNumber of noteNumbers) {
      const active = this.activeByNoteNumber.get(noteNumber);
      if (active === undefined) {
        continue;
      }

      active.noteGain.gain.cancelScheduledValues(now);
      active.noteGain.gain.setValueAtTime(
        Math.max(0.0001, active.noteGain.gain.value),
        now,
      );
      active.noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      active.oscillator.stop(now + 0.5);
      this.activeByNoteNumber.delete(noteNumber);
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (this.context !== null && this.masterGain !== null) {
      return this.context;
    }

    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    return context;
  }
}

class NotationBinarySong implements MidiBinarySong {
  private readonly notation: string;

  public constructor(notation: string) {
    this.notation = notation;
  }

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
      const octave = Number.parseInt(octaveText, 10);
      const durationMs = Number.parseInt(durationText, 10);
      const velocity = Number.parseInt(velocityText, 10);
      const channelOneBased = Number.parseInt(channelText, 10);
      const channel = Math.max(0, Math.min(15, channelOneBased - 1));

      return {
        noteNumber: noteNameToMidi(letter, accidental, octave),
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

function midiToFrequency(noteNumber: number): number {
  return 440 * 2 ** ((noteNumber - 69) / 12);
}
