export class VoiceKey {
  private constructor(
    public readonly channel: number,
    public readonly note: number,
  ) {}

  public static create(channel: number, note: number): VoiceKey {
    if (!Number.isInteger(channel) || channel < 0) {
      throw new Error("Invalid MIDI channel");
    }

    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new Error("Invalid MIDI note");
    }

    return new VoiceKey(channel, note);
  }

  public belongsToChannel(channel: number): boolean {
    return this.channel === channel;
  }

  public equals(other: VoiceKey): boolean {
    return this.channel === other.channel && this.note === other.note;
  }

  public toString(): string {
    return `${this.channel}:${this.note}`;
  }
}
