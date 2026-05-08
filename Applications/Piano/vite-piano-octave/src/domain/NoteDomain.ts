export const NOTE_SYMBOLS = [
  "C",
  "Cs",
  "D",
  "Ds",
  "E",
  "F",
  "Fs",
  "G",
  "Gs",
  "A",
  "As",
  "H"
] as const;

export type NoteSymbol = (typeof NOTE_SYMBOLS)[number];

export const SEMITONE_BY_NOTE: Readonly<Record<NoteSymbol, number>> = Object.freeze({
  C: 0,
  Cs: 1,
  D: 2,
  Ds: 3,
  E: 4,
  F: 5,
  Fs: 6,
  G: 7,
  Gs: 8,
  A: 9,
  As: 10,
  H: 11
});

export const MIDI_BY_NOTE: Readonly<Record<NoteSymbol, number>> = Object.freeze({
  C: 60,
  Cs: 61,
  D: 62,
  Ds: 63,
  E: 64,
  F: 65,
  Fs: 66,
  G: 67,
  Gs: 68,
  A: 69,
  As: 70,
  H: 71
});

export function isNoteSymbol(value: string): value is NoteSymbol {
  return (NOTE_SYMBOLS as readonly string[]).includes(value);
}
