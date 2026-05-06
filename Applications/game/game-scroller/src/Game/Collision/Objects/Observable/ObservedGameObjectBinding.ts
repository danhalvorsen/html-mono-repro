import type { CollisionObservedGameObject } from "../../CollisionSystemReactiveController.js";
import { GameObjectSubjectEventName } from "../../GameObjectSubjectEventName.js";
import type { ObservedGameObjectBindingOptions } from "./ObservedGameObjectBindingOptions.js";

export class ObservedGameObjectBinding {
  readonly #onObservedGameObjectChanged: (
    observedGameObject: CollisionObservedGameObject | null,
  ) => void;

  #observedGameObject: CollisionObservedGameObject | null = null;
  #unsubscribe: (() => void) | null = null;

  public constructor(options: ObservedGameObjectBindingOptions) {
    this.#onObservedGameObjectChanged = options.onObservedGameObjectChanged;
  }

  public get observedGameObject(): CollisionObservedGameObject | null {
    return this.#observedGameObject;
  }

  // FILE: src/Game/Collision/Objects/Observable/ObservedGameObjectBinding.ts

  public bind(observedGameObject: CollisionObservedGameObject | null): void {
    this.#unsubscribeFromCurrent();

    this.#observedGameObject = observedGameObject;

    if (!this.#observedGameObject) {
      this.#onObservedGameObjectChanged(null);
      return;
    }

    this.#unsubscribe = this.#observedGameObject.subscribeState(
      GameObjectSubjectEventName.PositionChanged,
      () => {
        this.#onObservedGameObjectChanged(this.#observedGameObject);
      },
    );

    this.#onObservedGameObjectChanged(this.#observedGameObject);
  }
  public clear(): void {
    this.#unsubscribeFromCurrent();
    this.#observedGameObject = null;
    this.#onObservedGameObjectChanged(null);
  }

  #unsubscribeFromCurrent(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }
}
