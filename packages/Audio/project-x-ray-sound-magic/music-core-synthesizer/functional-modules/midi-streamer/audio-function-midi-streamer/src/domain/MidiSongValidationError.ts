export class MidiSongValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "MidiSongValidationError";
  }
}
