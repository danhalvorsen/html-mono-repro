 
import type { IControllerHost } from "./IControllerHost.js";
import { ControllerHostCore } from "./IControllerHostCore.js";
import type { IReactiveShapeController } from "./IReactiveShapeController.js";

export class ReactiveShapeHost implements IControllerHost<ReactiveShapeHost> {
  dispose(): void {
    throw new Error("Method not implemented.");
  }
  private readonly core =
    new ControllerHostCore<ReactiveShapeHost, IReactiveShapeController<ReactiveShapeHost>>(this);

  public get isDirty(): boolean {
    return this.core.isDirty;
  }

  public get controllerCount(): number {
    return this.core.controllerCount;
  }

  public requestUpdate(): void {
    this.core.requestUpdate();
  }

  public addController(controller: IReactiveShapeController<ReactiveShapeHost>): void {
    this.core.addController(controller);
  }

  public removeController(controller: IReactiveShapeController<ReactiveShapeHost>): void {
    this.core.removeController(controller);
  }

  public updateIfNeeded(): boolean {
    return this.core.updateIfNeeded();
  }
}