import type {
  Polygon as CollisionPolygon,
  PolygonCollisionResult,
  PolygonCollisionSystem,
} from '@monorepo/core-collision-polygons';
import type { CollisionObservedGameObject } from '../../CollisionSystemReactiveController.js';
import type { CollisionIntersectionControlOptions } from './CollisionIntersectionControlOptions.js';

export class CollisionIntersectionControl {
  readonly #collisionSystem: PolygonCollisionSystem;
  readonly #sourcePolygonProvider: CollisionIntersectionControlOptions['sourcePolygonProvider'];
  readonly #targetPolygonProvider: CollisionIntersectionControlOptions['targetPolygonProvider'];
  readonly #onCollisionResult: CollisionIntersectionControlOptions['onCollisionResult'];
  readonly #onStateChanged: () => void;

  #observedGameObject: CollisionObservedGameObject | null = null;
  #lastResult: PolygonCollisionResult | null = null;

  public constructor(options: CollisionIntersectionControlOptions) {
    this.#collisionSystem = options.collisionSystem;
    this.#sourcePolygonProvider = options.sourcePolygonProvider;
    this.#targetPolygonProvider = options.targetPolygonProvider;
    this.#onCollisionResult = options.onCollisionResult;
    this.#onStateChanged = options.onStateChanged;
  }

  public get lastResult(): PolygonCollisionResult | null {
    return this.#lastResult;
  }

  public setObservedGameObject(
    observedGameObject: CollisionObservedGameObject | null
  ): void {
    this.#observedGameObject = observedGameObject;
  }

  public clear(): void {
    this.#observedGameObject = null;
    this.#setLastResult(null);
  }

  public checkCollision(): PolygonCollisionResult | null {
    if (!this.#observedGameObject) {
      this.#setLastResult(null);
      return null;
    }

    const source = this.#sourcePolygonProvider(this.#observedGameObject);
    const targets = this.#targetPolygonProvider();

    if (!source) {
      this.#setLastResult(null);
      return null;
    }

    const upperResult = this.#detectAgainstTarget(source, targets.upper);

    if (upperResult?.hasCollide) {
      this.#setLastResult(upperResult);
      this.#onCollisionResult?.(upperResult);
      return upperResult;
    }

    const lowerResult = this.#detectAgainstTarget(source, targets.lower);

    if (lowerResult?.hasCollide) {
      this.#setLastResult(lowerResult);
      this.#onCollisionResult?.(lowerResult);
      return lowerResult;
    }

    const lastResult = lowerResult ?? upperResult;

    this.#setLastResult(lastResult);

    if (lastResult) {
      this.#onCollisionResult?.(lastResult);
    }

    return lastResult;
  }

  #detectAgainstTarget(
    source: CollisionPolygon,
    target: CollisionPolygon | null
  ): PolygonCollisionResult | null {
    if (!target) {
      return null;
    }

    return this.#collisionSystem.detect({
      source,
      target,
    });
  }

  #setLastResult(result: PolygonCollisionResult | null): void {
    this.#lastResult = result;
    this.#onStateChanged();
  }
}
