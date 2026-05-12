import type { INoteFrequencyStrategy } from "./INoteFrequencyStrategy";

export class EqualTemperamentFrequencyStrategy implements INoteFrequencyStrategy {
  public toFrequencyHz(noteNumber: number): number {
    if (!Number.isInteger(noteNumber)) {
      throw new Error("MIDI note number must be an integer.");
    }

    if (noteNumber < 0 || noteNumber > 127) {
      throw new Error("MIDI note number must be between 0 and 127.");
    }

    return 440 * 2 ** ((noteNumber - 69) / 12);
  }
}