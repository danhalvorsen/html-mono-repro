import type { PolygonCollisionSystem } from '@monorepo/core-collision-polygons';
import type {
  CollisionResultObserver,
  SourceCollisionPolygonProvider,
  TargetCollisionPolygonProvider,
} from '../../CollisionSystemReactiveController.js';

export interface CollisionIntersectionControlOptions {
  readonly collisionSystem: PolygonCollisionSystem;
  readonly sourcePolygonProvider: SourceCollisionPolygonProvider;
  readonly targetPolygonProvider: TargetCollisionPolygonProvider;
  readonly onCollisionResult: CollisionResultObserver | null;
  readonly onStateChanged: () => void;
}
