import type { Vector2 } from '@monorepo/core-math';
import type { Polygon } from './polygon.js';

export interface CaveScene {
  readonly polygon: Polygon;
  readonly collisionPolygon: Polygon;
  readonly referencePoints: readonly Vector2[];
}
