import { SpatialConstraint } from "./SpatialConstraint.js";

export interface RectangleNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees (0–360)
  constraints?: SpatialConstraint[];
}