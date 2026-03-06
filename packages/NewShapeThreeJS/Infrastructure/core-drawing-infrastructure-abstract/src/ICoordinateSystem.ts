 
import type { Vector2 } from "@monorepo/core-math"; 
 
export interface ICoordinateSystem {
  toWorld(point: Vector2): Vector2
  toScreen(point: Vector2): Vector2
}
