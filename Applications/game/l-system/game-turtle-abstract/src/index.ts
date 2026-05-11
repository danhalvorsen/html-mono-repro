export { TurtleDomainError } from "./errors/TurtleDomainError.js";
export { PopEmptyStackError } from "./errors/PopEmptyStackError.js";
export { InvalidRotationError } from "./errors/InvalidRotationError.js";
export { InvalidPrimitiveParameterError } from "./errors/InvalidPrimitiveParameterError.js";

export type { Vector3 } from "./vectors/Vector3.js";

export type { StrokeStyle } from "./styles/StrokeStyle.js";
export type { FillStyle } from "./styles/FillStyle.js";

export { PrimitiveKind } from "./primitives/PrimitiveKind.js";
export type { PrimitiveKind as PrimitiveKindValue } from "./primitives/PrimitiveKind.js";
export type { PrimitiveMetadata } from "./primitives/PrimitiveMetadata.js";
export type {
  LinePrimitive,
  PolylinePrimitive,
  CirclePrimitive,
  PolygonPrimitive,
  TurtlePrimitive,
} from "./primitives/TurtlePrimitive.js";
export type {
  CreateLinePrimitiveOptions,
  CreatePolylinePrimitiveOptions,
  CreateCirclePrimitiveOptions,
  CreatePolygonPrimitiveOptions,
} from "./primitives/CreatePrimitiveOptions.js";
export type { IPrimitiveFactory } from "./primitives/IPrimitiveFactory.js";
export { PrimitiveValueCopier } from "./primitives/PrimitiveValueCopier.js";
export { DefaultPrimitiveFactory } from "./primitives/DefaultPrimitiveFactory.js";

export type { ITurtleVectorMath } from "./math/ITurtleVectorMath.js";
export { DefaultTurtleVectorMath } from "./math/DefaultTurtleVectorMath.js";

export type { TurtleMode } from "./turtle/TurtleMode.js";
export type { TurtleSnapshot, TurtleState } from "./turtle/TurtleSnapshot.js";
export type { ITurtle3D } from "./turtle/ITurtle3D.js";
export type { ITurtle2D } from "./turtle/ITurtle2D.js";
export { TurtleStateFactory } from "./turtle/TurtleStateFactory.js";
export { DefaultTurtle3D } from "./turtle/DefaultTurtle3D.js";
export { DefaultTurtle2D } from "./turtle/DefaultTurtle2D.js";
export { DefaultTurtleFactory } from "./turtle/DefaultTurtleFactory.js";