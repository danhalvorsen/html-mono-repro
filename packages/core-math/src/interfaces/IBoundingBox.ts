import { Vector2 } from './IPoint.js'

export interface IBoundingBox {
  min: Vector2;
  max: Vector2;

  width(): number;
  height(): number;
  center(): Vector2;
  contains(p: Vector2): boolean;
  intersects(other: IBoundingBox): boolean;
}
