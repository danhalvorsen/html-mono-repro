export interface INoteFrequencyStrategy {
  toFrequencyHz(noteNumber: number): number;
}