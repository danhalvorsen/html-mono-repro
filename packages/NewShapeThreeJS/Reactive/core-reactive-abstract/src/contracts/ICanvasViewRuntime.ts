import { IControllerHost } from "./IControllerHost.js";
import { ReactiveShapeHost } from "./ReactiveShapeHost.js";

export interface ICanvasViewRuntime {
  add(shape: IControllerHost<ReactiveShapeHost>): void;
  remove(shape: IControllerHost<ReactiveShapeHost>): void;
  tick(): void;
}
