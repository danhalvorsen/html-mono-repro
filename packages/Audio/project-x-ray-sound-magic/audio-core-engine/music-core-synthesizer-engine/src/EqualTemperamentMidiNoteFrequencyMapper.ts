import type { IMidiNoteFrequencyMapper, Hertz } from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Frequency
============================================================================ */

export class EqualTemperamentMidiNoteFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note: number): Hertz {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 440 * Math.pow(2, (note - 69) / 12);
  }
}
