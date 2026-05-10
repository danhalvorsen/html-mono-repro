export class NoteKey {
  public static create(channel: number, noteNumber: number): string {
    return `${channel}:${noteNumber}`;
  }
}
