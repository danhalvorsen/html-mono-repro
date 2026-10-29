 
import { Vector3 } from "@monorepo/core-math";
import { IShape } from "./IShape.js";

export interface ILine extends IShape {
  po: Vector3;
  p1: Vector3;
}
