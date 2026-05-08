import type { IMidiNoteMapper } from "./IMidiNoteMapper";
import { MIDI_BY_NOTE, isNoteSymbol } from "../domain/NoteDomain";

export class DefaultMidiNoteMapper implements IMidiNoteMapper {
  private static readonly MIDDLE_C_VISUAL_OCTAVE_INDEX = 3;
  private static readonly SEMITONES_PER_OCTAVE = 12;
  private static readonly MIN_MIDI_NOTE = 0;
  private static readonly MAX_MIDI_NOTE = 127;

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

    if (
      midi < DefaultMidiNoteMapper.MIN_MIDI_NOTE ||
      midi > DefaultMidiNoteMapper.MAX_MIDI_NOTE
    ) {
      return null;
    }

    return midi;
  }
}