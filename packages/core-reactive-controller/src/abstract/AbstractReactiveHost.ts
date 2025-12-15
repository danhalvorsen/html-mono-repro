import { ControllerCollection } from "../utils/ControllerCollection.js";
import { IReactiveController } from "../contracts/IReactiveController.js";
import { IReactiveHost } from "../contracts/IReactiveHost.js";

/**
 * Base implementation of a Reactive Host.
 * Tech-specific hosts (DOM, Canvas, Three) extend this class.
 */
export abstract class AbstractReactiveHost implements IReactiveHost {
  private readonly _controllers = new ControllerCollection<IReactiveController>();

  addController(controller: IReactiveController): void {
    this._controllers.add(controller);
    controller.attachTo(this);
  }

  removeController(controller: IReactiveController): void {
    controller.detachFrom?.(this);
    this._controllers.delete(controller);
  }

  // --- lifecycle propagation ---
  notifyConnected(): void { this._controllers.forEach(c => c.onHostConnected?.()); }
  notifyDisconnected(): void { this._controllers.forEach(c => c.onHostDisconnected?.()); }
  notifyUpdate(): void { this._controllers.forEach(c => c.onHostUpdate?.()); }
  notifyUpdated(): void { this._controllers.forEach(c => c.onHostUpdated?.()); }
}
