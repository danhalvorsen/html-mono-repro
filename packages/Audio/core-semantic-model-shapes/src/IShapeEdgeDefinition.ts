import type {
  SemanticEdgeId,
  SemanticVertexId,
} from "@monorepo/core-semantic-model";

import type { ShapeEdgePoint } from "./types.js";
import type { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";

export interface IShapeEdgeDefinition {
  readonly id: SemanticEdgeId;
  readonly address: ShapeEdgeAddress;
  readonly startVertexId: SemanticVertexId;
  readonly endVertexId: SemanticVertexId;
  readonly points: readonly ShapeEdgePoint[];
}