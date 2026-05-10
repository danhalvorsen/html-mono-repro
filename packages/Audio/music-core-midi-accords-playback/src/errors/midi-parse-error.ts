export class MidiParseError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "MidiParseError";
  }
}
