import type { PrimitiveMetadata } from "../primitives/PrimitiveMetadata.js";
import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type { TurtleMode } from "./TurtleMode.js";

export type TurtleSnapshot = {
  readonly position: Vector3;
  readonly forward: Vector3;
  readonly left: Vector3;
  readonly up: Vector3;
  readonly isPenDown: boolean;
  readonly mode: TurtleMode;
  readonly stroke: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};

export type TurtleState = TurtleSnapshot;