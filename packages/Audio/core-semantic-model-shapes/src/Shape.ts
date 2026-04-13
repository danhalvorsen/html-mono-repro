// packages/Audio/core-semantic-model-shapes/src/Shape.ts
import type { ISemanticShape } from "@monorepo/core-semantic-model";
import type { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";
import type { ShapeEdgePointAddress } from "./ShapeEdgePointAddress.js";
import type { ShapeVertexAddressLike } from "./types.js";

export type Shape = ISemanticShape<
  ShapeVertexAddressLike,
  ShapeEdgeAddress,
  ShapeEdgePointAddress
>;