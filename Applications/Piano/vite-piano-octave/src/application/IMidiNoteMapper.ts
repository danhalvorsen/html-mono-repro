export interface IMidiNoteMapper {
  toMidi(note: string): number | null;
}
