import type { CollisionObservedGameObject } from '../../CollisionSystemReactiveController.js';

export interface ObservedGameObjectBindingOptions {
  readonly onObservedGameObjectChanged: (
    observedGameObject: CollisionObservedGameObject | null
  ) => void;
}
