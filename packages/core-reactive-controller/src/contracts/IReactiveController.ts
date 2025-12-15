import { IReactiveHost } from "./IReactiveHost.js";
import { IReactiveLifecycle } from "./IReactiveLifecycle.js";
 
/**
 * A controller reacts to host lifecycle events.
 * Every technology-specific controller extends this contract.
 */
export interface IReactiveController extends Partial<IReactiveLifecycle> {
  /** Called when the controller is attached to a host. */
  attachTo(host: IReactiveHost): void;

  /** Optional cleanup when controller is removed. */
  detachFrom?(host: IReactiveHost): void;
}

