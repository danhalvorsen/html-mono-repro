// packages/NewShapeThreeJS/Reactive/core-reactive-threejs/src/host/ReactiveHost.ts

import type {
  IReactiveController,
  IReactiveHost
} from "@monorepo/core-reactive-abstract";
import { ControllerHostCore } from "@monorepo/core-reactive-abstract";

export class ReactiveHost implements IReactiveHost<ReactiveHost> {
  private readonly core =
    new ControllerHostCore<ReactiveHost, IReactiveController<ReactiveHost>>(this);

  public get isDirty(): boolean {
    return this.core.isDirty;
  }

  public get controllerCount(): number {
    return this.core.controllerCount;
  }

  public addController(controller: IReactiveController<ReactiveHost>): void {
    this.core.addController(controller);
  }

  public removeController(controller: IReactiveController<ReactiveHost>): void {
    this.core.removeController(controller);
  }

  public requestUpdate(): void {
    this.core.requestUpdate();
  }

  public updateIfNeeded(): boolean {
    return this.core.updateIfNeeded();
  }

  public markDirty(): void {
    this.requestUpdate();
  }

}