import { IReactiveController } from "./IReactiveController.js";

/**
 * A host manages lifecycle propagation to its controllers.
 * It may be a DOM element, Three.js object, or any runtime entity.
 */
export interface IReactiveHost {
  addController(controller: IReactiveController): void;
  removeController(controller: IReactiveController): void;

  /** Called by external environment to trigger lifecycle. */
  notifyConnected(): void;
  notifyDisconnected(): void;
  notifyUpdate(): void;
  notifyUpdated(): void;
}
