import type {
  CreateCirclePrimitiveOptions,
  CreateLinePrimitiveOptions,
  CreatePolygonPrimitiveOptions,
  CreatePolylinePrimitiveOptions,
} from "./CreatePrimitiveOptions.js";
import type {
  CirclePrimitive,
  LinePrimitive,
  PolygonPrimitive,
  PolylinePrimitive,
} from "./TurtlePrimitive.js";

export interface IPrimitiveFactory {
  createLine(options: CreateLinePrimitiveOptions): LinePrimitive;
  createPolyline(options: CreatePolylinePrimitiveOptions): PolylinePrimitive;
  createCircle(options: CreateCirclePrimitiveOptions): CirclePrimitive;
  createPolygon(options: CreatePolygonPrimitiveOptions): PolygonPrimitive;
}