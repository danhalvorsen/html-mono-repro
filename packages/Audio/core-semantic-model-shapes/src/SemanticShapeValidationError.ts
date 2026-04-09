// ============================================================================
// FILE: packages/core-semantic-shapes/src/errors.ts
// ============================================================================

export class SemanticShapeValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SemanticShapeValidationError";
  }
}
