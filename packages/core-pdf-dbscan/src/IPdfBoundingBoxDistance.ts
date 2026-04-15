import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";

export interface IPdfBoundingBoxDistance {
  measure(left: IPdfBoundingBox, right: IPdfBoundingBox): number;
}
