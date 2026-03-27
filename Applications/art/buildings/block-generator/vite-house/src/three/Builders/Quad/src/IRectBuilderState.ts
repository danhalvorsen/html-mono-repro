import type { IRectSize } from "./IRectSize";
import type { IRectState } from "./IRectState";
import type { RectOperation } from "./RectOperation";

export interface IRectBuilderState {
  readonly rects: ReadonlyArray<IRectState>;
  readonly pendingSize?: IRectSize;
  readonly pendingOperations: ReadonlyArray<RectOperation>;
}
