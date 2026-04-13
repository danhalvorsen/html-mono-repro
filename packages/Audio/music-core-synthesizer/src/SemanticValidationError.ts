export class SemanticValidationError extends Error {
  public readonly validationErrors: readonly string[];

  public constructor(message: string, validationErrors: readonly string[]) {
    super(message);
    this.name = "SemanticValidationError";
    this.validationErrors = validationErrors;
  }
}
