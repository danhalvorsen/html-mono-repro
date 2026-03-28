import type { IRectSize } from "./IRectSize.js";
import type { IRectState } from "./IRectState.js";
import type { RectOperation } from "./RectOperation.js";

export interface IRectBuilderState {
  readonly rects: ReadonlyArray<IRectState>;
  readonly pendingSize?: IRectSize;
  readonly pendingOperations: ReadonlyArray<RectOperation>;
}
