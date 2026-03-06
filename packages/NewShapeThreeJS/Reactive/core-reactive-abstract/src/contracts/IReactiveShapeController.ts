import { IReactiveController } from "./IReactiveController.js";

export interface IReactiveShapeController<THost> extends IReactiveController<THost> {
  // Optional input hooks (wired by your CanvasView / InputRouter)
  onPointerMove?(e: unknown): void;
  onPointerDown?(e: unknown): void;
  onPointerUp?(e: unknown): void;
   
}
