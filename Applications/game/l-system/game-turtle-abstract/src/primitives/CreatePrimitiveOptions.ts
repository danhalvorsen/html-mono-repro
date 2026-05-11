import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type { PrimitiveMetadata } from "./PrimitiveMetadata.js";

export type CreateLinePrimitiveOptions = {
  readonly from: Vector3;
  readonly to: Vector3;
  readonly stroke: StrokeStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type CreatePolylinePrimitiveOptions = {
  readonly points: readonly Vector3[];
  readonly stroke: StrokeStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type CreateCirclePrimitiveOptions = {
  readonly center: Vector3;
  readonly radius: number;
  readonly normal: Vector3;
  readonly stroke?: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type CreatePolygonPrimitiveOptions = {
  readonly points: readonly Vector3[];
  readonly stroke?: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};