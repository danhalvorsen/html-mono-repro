export class MidiTextDecoder {
  public static decode(bytes: readonly number[]): string {
    return String.fromCharCode(...bytes);
  }
}
