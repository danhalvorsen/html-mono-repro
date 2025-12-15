import { Vector3 } from "three";
import { IShape } from "./IShape.js";

export interface ILine extends IShape {
  po: Vector3;
  p1: Vector3;
}
