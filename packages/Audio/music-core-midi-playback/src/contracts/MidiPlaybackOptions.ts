export type MidiPlaybackOptions = {
  readonly noteLengthSeconds?: number;
  readonly sustainUntilNoteOff?: boolean;
  readonly startAtSeconds?: number;
  readonly filterFrequency?: number;
  readonly filterQ?: number;
  readonly sustain?: number;
};
