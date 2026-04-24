export class GitRelativePath {
  private constructor(private readonly normalizedValue: string) {}

  public static create(value: string): GitRelativePath {
    const normalized = value.trim().replaceAll("\\", "/");

    if (normalized.length === 0) {
      throw new Error("GitRelativePath cannot be empty.");
    }

    return new GitRelativePath(normalized);
  }

  public toString(): string {
    return this.normalizedValue;
  }

  public equals(other: GitRelativePath): boolean {
    return this.normalizedValue === other.normalizedValue;
  }

  public startsWith(prefix: string): boolean {
    return this.normalizedValue.startsWith(prefix);
  }

  public endsWith(suffix: string): boolean {
    return this.normalizedValue.endsWith(suffix);
  }
}

