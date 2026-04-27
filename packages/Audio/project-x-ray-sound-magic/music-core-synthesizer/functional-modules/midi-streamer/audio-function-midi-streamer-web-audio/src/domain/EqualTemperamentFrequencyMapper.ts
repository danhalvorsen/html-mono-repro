export interface IFrequencyMapper {
  mapMidiNoteToFrequency(note: number): number;
}

export class EqualTemperamentFrequencyMapper implements IFrequencyMapper {
  public mapMidiNoteToFrequency(note: number): number {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new RangeError("note must be an integer in range 0..127.");
    }

    return 440 * 2 ** ((note - 69) / 12);
  }
}