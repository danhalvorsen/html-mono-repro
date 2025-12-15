import { IInputController } from "./IInputController.js";
import { IMouseEvent } from "./IMouseEvent.js";
 
export interface IMouseController extends IInputController<IMouseEvent> {
  /** Enable hardware listeners */
  enable(): void;

  /** Disable hardware listeners */
  disable(): void;

  /** Dispose internal resources */
  destroy(): void;
}

