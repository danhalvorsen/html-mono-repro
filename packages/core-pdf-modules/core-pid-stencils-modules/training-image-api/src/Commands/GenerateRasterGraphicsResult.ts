export class GenerateRasterGraphicsResult {
  public constructor(
    public readonly sourceFilesFound: number,
    public readonly filesGenerated: number,
    public readonly errors: readonly string[] = [],
  ) {}
}