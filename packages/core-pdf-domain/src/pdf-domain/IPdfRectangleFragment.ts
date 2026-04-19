import type { IBoundingBox } from "../core/IBoundingBox.js";

export interface IPdfRectangleFragment {
  readonly kind: "rectangle";
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
}