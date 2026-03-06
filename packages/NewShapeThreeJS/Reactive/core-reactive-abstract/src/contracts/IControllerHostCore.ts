import { IReactiveController } from "./IReactiveController.js";
import { IReactiveHost } from "./IReactiveHost.js";

export interface IControllerHostCore<
  THost,
  TController extends IReactiveController<THost>
> extends IReactiveHost<THost> {
  readonly isDirty: boolean;
  readonly controllerCount: number;

  addController(controller: TController): void;
  removeController(controller: TController): void;
  updateIfNeeded(): boolean;
}

export class ControllerHostCore<
  THost,
  TController extends IReactiveController<THost>
> implements IControllerHostCore<THost, TController> {
  private readonly controllers = new Set<TController>();
  private dirty = true;

  public constructor(private readonly host: THost) {}

  public get isDirty(): boolean {
    return this.dirty;
  }

  public get controllerCount(): number {
    return this.controllers.size;
  }

  public requestUpdate(): void {
    this.dirty = true;
  }

  public addController(controller: TController): void {
    if (this.controllers.has(controller)) {
      return;
    }

    this.controllers.add(controller);
    controller.hostConnected?.(this.host);
    this.requestUpdate();
  }

  public removeController(controller: TController): void {
    if (!this.controllers.delete(controller)) {
      return;
    }

    controller.hostDisconnected?.();
    this.requestUpdate();
  }

  public updateIfNeeded(): boolean {
    if (!this.dirty) {
      return false;
    }

    this.dirty = false;

    for (const controller of this.controllers) {
      controller.hostUpdate?.();
    }

    return true;
  }
}