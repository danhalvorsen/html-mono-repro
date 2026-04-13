// packages/Audio/core-semantic-model-shapes/src/types.ts
import type {
  ISemanticAddress,
  ISemanticEdge,
  ISemanticEdgePoint,
  ISemanticTopology,
  ISemanticVertex,
} from "@monorepo/core-semantic-model";

import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import { SemanticShapeKind } from "./SemanticShapeKind.js";
import type { OrdinalVertexAddress } from "./OrdinalVertexAddress.js";
import { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";
import { ShapeEdgePointAddress } from "./ShapeEdgePointAddress.js";
import { ShapeVertexAddress } from "./ShapeVertexAddress.js";

export const ShapeAddressDomains = {
  Vertex: "shape.vertex",
  Edge: "shape.edge",
  EdgePoint: "shape.edge-point",
} as const;

export const VertexAddressKeys = {
  LeftTop: "LeftTop",
  TopCenter: "TopCenter",
  RightTop: "RightTop",
  RightCenter: "RightCenter",
  RightBottom: "RightBottom",
  BottomCenter: "BottomCenter",
  LeftBottom: "LeftBottom",
  LeftCenter: "LeftCenter",
  Center: "Center",
  BoundaryVertex: "BoundaryVertex",
} as const;

export type VertexAddressKey =
  typeof VertexAddressKeys[keyof typeof VertexAddressKeys];

export type EdgeAddressKey =
  typeof EdgeAddressKeys[keyof typeof EdgeAddressKeys];

export const EdgePointAddressKeys = {
  Start: "Start",
  Midpoint: "Midpoint",
  End: "End",
} as const;

export type EdgePointAddressKey =
  typeof EdgePointAddressKeys[keyof typeof EdgePointAddressKeys];

export const SemanticShapeKindNames = {
  Rectangle: "Rectangle",
  Ellipse: "Ellipse",
  Line: "Line",
  Polygon: "Polygon",
  Polyline: "Polyline",
} as const;

export type SemanticShapeKindName =
  typeof SemanticShapeKindNames[keyof typeof SemanticShapeKindNames];

export const SemanticShapeKinds = Object.freeze({
  Rectangle: new SemanticShapeKind(SemanticShapeKindNames.Rectangle),
  Ellipse: new SemanticShapeKind(SemanticShapeKindNames.Ellipse),
  Line: new SemanticShapeKind(SemanticShapeKindNames.Line),
  Polygon: new SemanticShapeKind(SemanticShapeKindNames.Polygon),
  Polyline: new SemanticShapeKind(SemanticShapeKindNames.Polyline),
});

export type ShapeVertexAddressLike =
  | ShapeVertexAddress
  | OrdinalVertexAddress
  | ISemanticAddress;

export type ShapeVertex = ISemanticVertex<ShapeVertexAddressLike>;
export type ShapeEdgePoint = ISemanticEdgePoint<ShapeEdgePointAddress>;
export type ShapeEdge = ISemanticEdge<ShapeEdgeAddress, ShapeEdgePointAddress>;
export type ShapeTopology = ISemanticTopology<
  ShapeVertexAddressLike,
  ShapeEdgeAddress,
  ShapeEdgePointAddress
>;