export class MidiNoteFrequencyMapper {
  public toFrequencyHz(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }
}
