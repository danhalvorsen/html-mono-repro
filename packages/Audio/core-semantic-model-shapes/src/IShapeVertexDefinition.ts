// ============================================================================
// FILE: packages/core-semantic-shapes/src/contracts.ts
// ============================================================================
import type {
  IPoint2D, SemanticVertexId
} from "@monorepo/core-semantic-model";
import type {
  ShapeVertexAddress
} from "./addresses.js";


export interface IShapeVertexDefinition {
  readonly id: SemanticVertexId;
  readonly address: ShapeVertexAddress;
  readonly position: IPoint2D;
}

