import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type {
  Polygon,
  PolygonCollisionResult,
  PolygonCollisionSystem,
} from '@monorepo/core-collision-polygons';
import type {
  IGameObjectObservableSubject,
  IGameObjectSubject,
} from '../GameObjectSubject.js';
import { CollisionIntersectionControl } from './Objects/Intersection/CollisionIntersectionControl.js';
import { ObservedGameObjectBinding } from './Objects/Observable/ObservedGameObjectBinding.js';

export type CollisionObservedGameObject =
  IGameObjectSubject &
  IGameObjectObservableSubject;

export interface CollisionTargetPolygons {
  readonly upper: Polygon | null;
  readonly lower: Polygon | null;
}

export type SourceCollisionPolygonProvider = (
  observedGameObject: CollisionObservedGameObject
) => Polygon | null;

export type TargetCollisionPolygonProvider = () => CollisionTargetPolygons;

export type CollisionResultObserver = (
  result: PolygonCollisionResult
) => void;

export interface CollisionSystemReactiveControllerOptions {
  readonly host: ReactiveControllerHost;
  readonly collisionSystem: PolygonCollisionSystem;
  readonly sourcePolygonProvider: SourceCollisionPolygonProvider;
  readonly targetPolygonProvider: TargetCollisionPolygonProvider;
  readonly onCollisionResult?: CollisionResultObserver;
}

export interface ICollisionReactiveController {
  readonly observedGameObject: CollisionObservedGameObject | null;
  readonly lastResult: PolygonCollisionResult | null;

  setObservedGameObject(
    observedGameObject: CollisionObservedGameObject | null | undefined
  ): void;

  checkCollision(): PolygonCollisionResult | null;
}

export class CollisionSystemReactiveController
  implements ReactiveController, ICollisionReactiveController
{
  readonly #host: ReactiveControllerHost;
  readonly #observer: ObservedGameObjectBinding;
  readonly #intersectionControl: CollisionIntersectionControl;

  public constructor(options: CollisionSystemReactiveControllerOptions) {
    this.#host = options.host;

    this.#intersectionControl = new CollisionIntersectionControl({
      collisionSystem: options.collisionSystem,
      sourcePolygonProvider: options.sourcePolygonProvider,
      targetPolygonProvider: options.targetPolygonProvider,
      onCollisionResult: options.onCollisionResult ?? null,
      onStateChanged: () => this.#host.requestUpdate(),
    });

    this.#observer = new ObservedGameObjectBinding({
      onObservedGameObjectChanged: observedGameObject => {
        this.#intersectionControl.setObservedGameObject(observedGameObject);
        this.checkCollision();
      },
    });

    this.#host.addController(this);
  }

  public get observedGameObject(): CollisionObservedGameObject | null {
    return this.#observer.observedGameObject;
  }

  public get lastResult(): PolygonCollisionResult | null {
    return this.#intersectionControl.lastResult;
  }

  public setObservedGameObject(
    observedGameObject: CollisionObservedGameObject | null | undefined
  ): void {
    this.#observer.bind(observedGameObject ?? null);
  }

  public checkCollision(): PolygonCollisionResult | null {
    return this.#intersectionControl.checkCollision();
  }

  public hostDisconnected(): void {
    this.#observer.clear();
    this.#intersectionControl.clear();
  }
}
