
import type { IReactiveHost } from "./IReactiveHost.js";
import type { IReactiveShapeController } from "./IReactiveShapeController.js";

export interface IControllerHost<THost> extends IReactiveHost<THost> {
  addController(controller: IReactiveShapeController<THost>): void;
  removeController(controller: IReactiveShapeController<THost>): void;

  updateIfNeeded(): boolean;

  readonly controllerCount: number;
  readonly isDirty: boolean;

  dispose(): void
}