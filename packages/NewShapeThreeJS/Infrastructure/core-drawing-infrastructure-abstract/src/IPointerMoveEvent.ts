import type { Vector2 } from "@monorepo/core-math";
import { IPointerEvent } from "./IPointerEvent.js";

export interface IPointerMoveEvent extends IPointerEvent {
  readonly delta: Vector2;
}
