export type ShapePayload =
  | CirclePayload
  | RectanglePayload
  | PolygonPayload
  | VertexPayload;

// ====================================================================================
// CIRCLE
// ====================================================================================

export type CirclePayload = Readonly<{
  kind: "circle";
  radius: number;
}>;

// ====================================================================================
// RECTANGLE
// ====================================================================================

export type RectanglePayload = Readonly<{
  kind: "rectangle";
  width: number;
  height: number;
}>;

// ====================================================================================
// POLYGON
// ====================================================================================

export type PolygonPayload = Readonly<{
  kind: "polygon";
  points: readonly { x: number; y: number }[];
  closed: boolean;
}>;

// ====================================================================================
// VERTEX
// ====================================================================================

export type VertexPayload = Readonly<{
  kind: "vertex";
  size: number;
  marker: "circle" | "arrow";
  rotation?: number;
}>;