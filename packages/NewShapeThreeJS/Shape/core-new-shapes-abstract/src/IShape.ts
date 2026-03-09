import { ShapeId } from "./ShapeId.js";
import { ShapeType } from "./ShapeType.js";


export interface IShape {
  readonly id: ShapeId;
  readonly type: ShapeType;
}
