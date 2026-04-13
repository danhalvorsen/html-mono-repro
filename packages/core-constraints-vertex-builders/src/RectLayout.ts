import type { IRectState } from "./IRectState.js";

export class RectLayout {
  public readonly rects: ReadonlyArray<IRectState>;

  public constructor(rects: ReadonlyArray<IRectState>) {
    this.rects = Object.freeze([...rects]);
    Object.freeze(this);
  }
}
