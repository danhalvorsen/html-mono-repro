import { IReactiveController } from "../contracts/IReactiveController.js";
import { IReactiveHost } from "../contracts/IReactiveHost.js";

/**
 * Abstract base providing empty lifecycle stubs.
 * Subclasses override what they need.
 */
export abstract class AbstractReactiveController implements IReactiveController {
  protected host!: IReactiveHost;

  attachTo(host: IReactiveHost): void {
    this.host = host;
    this.onAttach();
  }

  detachFrom?(host: IReactiveHost): void {
    this.onDetach();
  }

  // --- abstract hooks (pure virtual equivalents) ---
  protected abstract onAttach(): void;
  protected abstract onDetach(): void;

  // --- lifecycle hooks ---
  onHostConnected(): void {}
  onHostDisconnected(): void {}
  onHostUpdate(): void {}
  onHostUpdated(): void {}
}
