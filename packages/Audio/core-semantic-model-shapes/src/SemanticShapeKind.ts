import type { ISemanticShapeKind } from "@monorepo/core-semantic-model";
import type { SemanticShapeKindName } from "./types.js";

export class SemanticShapeKind implements ISemanticShapeKind {
  public constructor(public readonly name: SemanticShapeKindName) {}
}