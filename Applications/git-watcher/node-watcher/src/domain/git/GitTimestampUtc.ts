export class GitTimestampUtc {
  private constructor(private readonly isoValue: string) {}

  public static create(value: string): GitTimestampUtc {
    const trimmed = value.trim();

    if (!trimmed.endsWith("Z")) {
      throw new Error("GitTimestampUtc must be UTC and end with 'Z'.");
    }

    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) {
      throw new Error("GitTimestampUtc must be a valid ISO-8601 timestamp.");
    }

    return new GitTimestampUtc(trimmed);
  }

  public toString(): string {
    return this.isoValue;
  }
}

