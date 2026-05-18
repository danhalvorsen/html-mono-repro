export type MidiTimeSignature = {
  readonly numerator: number;
  readonly denominator: number;
  readonly metronomeClick: number;
  readonly thirtySecondNotesPerQuarter: number;
};

export type MidiKeySignature = {
  readonly accidentals: number;
  readonly scale: "major" | "minor";
};
