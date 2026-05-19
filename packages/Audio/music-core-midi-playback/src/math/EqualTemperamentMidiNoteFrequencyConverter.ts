import type { IMidiNoteFrequencyConverter } from "./IMidiNoteFrequencyConverter.js";

export class EqualTemperamentMidiNoteFrequencyConverter
  implements IMidiNoteFrequencyConverter
{
  private static readonly referenceFrequencyHz = 440;
  private static readonly referenceMidiNote = 69;
  private static readonly semitonesPerOctave = 12;

  public toFrequency(note: number): number {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new Error("Invalid MIDI note");
    }

    return (
      EqualTemperamentMidiNoteFrequencyConverter.referenceFrequencyHz *
      Math.pow(
        2,
        (note - EqualTemperamentMidiNoteFrequencyConverter.referenceMidiNote) /
          EqualTemperamentMidiNoteFrequencyConverter.semitonesPerOctave,
      )
    );
  }
}
