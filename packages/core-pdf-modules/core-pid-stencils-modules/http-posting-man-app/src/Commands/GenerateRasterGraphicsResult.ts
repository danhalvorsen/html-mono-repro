export class GenerateRasterGraphicsResult {
  public readonly sourceFilesFound: number;
  public readonly filesGenerated: number;
  public readonly errors: readonly string[];

  public constructor(
    sourceFilesFound: number,
    filesGenerated: number,
    errors: readonly string[] = [],
  ) {
    this.sourceFilesFound = sourceFilesFound;
    this.filesGenerated = filesGenerated;
    this.errors = errors;
  }
}