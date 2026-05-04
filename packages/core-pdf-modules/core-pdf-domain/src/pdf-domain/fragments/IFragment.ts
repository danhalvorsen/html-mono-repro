import type { IBoundingBox } from "../../core/IBoundingBox.js";

export interface IFragment {
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
}
