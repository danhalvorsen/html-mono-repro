export type MidiFileHeader = {
  readonly format: 0 | 1 | 2;
  readonly trackCount: number;
  readonly division: MidiDivision;
};

export type MidiDivision =
  | {
      readonly kind: "ticks-per-quarter-note";
      readonly ticksPerQuarterNote: number;
    }
  | {
      readonly kind: "smpte";
      readonly framesPerSecond: number;
      readonly ticksPerFrame: number;
    };
