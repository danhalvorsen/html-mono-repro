export interface IMidiNoteMapper {
  toMidi(note: string, octaveIndex?: number): number | null;
}