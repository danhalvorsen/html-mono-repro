import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type { PrimitiveMetadata } from "./PrimitiveMetadata.js";
import { PrimitiveKind } from "./PrimitiveKind.js";

export type LinePrimitive = {
  readonly kind: typeof PrimitiveKind.Line;
  readonly from: Vector3;
  readonly to: Vector3;
  readonly stroke: StrokeStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type PolylinePrimitive = {
  readonly kind: typeof PrimitiveKind.Polyline;
  readonly points: readonly Vector3[];
  readonly stroke: StrokeStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type CirclePrimitive = {
  readonly kind: typeof PrimitiveKind.Circle;
  readonly center: Vector3;
  readonly radius: number;
  readonly normal: Vector3;
  readonly stroke?: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type PolygonPrimitive = {
  readonly kind: typeof PrimitiveKind.Polygon;
  readonly points: readonly Vector3[];
  readonly stroke?: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type TurtlePrimitive =
  | LinePrimitive
  | PolylinePrimitive
  | CirclePrimitive
  | PolygonPrimitive;