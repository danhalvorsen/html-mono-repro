import { MIDI_BY_NOTE, isNoteSymbol } from "../domain/NoteDomain";

export class DefaultMidiNoteMapper {
  private static readonly MIDDLE_C_VISUAL_OCTAVE_INDEX = 3;
  private static readonly SEMITONES_PER_OCTAVE = 12;

  public toMidi(note: string, octaveIndex?: number): number | null {
    if (!isNoteSymbol(note)) {
      return null;
    }

    const baseMidi = MIDI_BY_NOTE[note];
    if (octaveIndex === undefined) {
      return baseMidi;
    }

    if (!Number.isInteger(octaveIndex) || octaveIndex < 0) {
      return null;
    }

    const midi =
      baseMidi +
      (octaveIndex - DefaultMidiNoteMapper.MIDDLE_C_VISUAL_OCTAVE_INDEX) *
        DefaultMidiNoteMapper.SEMITONES_PER_OCTAVE;

    if (midi < 0 || midi > 127) {
      return null;
    }

    return midi;
  }
}
