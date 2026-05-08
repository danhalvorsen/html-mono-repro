import type { IMidiNoteMapper } from "./IMidiNoteMapper";
import { MIDI_BY_NOTE, isNoteSymbol } from "../domain/NoteDomain";

export class DefaultMidiNoteMapper implements IMidiNoteMapper {
  public toMidi(note: string): number | null {
    if (!isNoteSymbol(note)) return null;
    return MIDI_BY_NOTE[note];
  }
}
