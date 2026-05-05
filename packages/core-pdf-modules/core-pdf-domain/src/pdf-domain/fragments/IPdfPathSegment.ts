import type { IBoundingBox } from "../../core/IBoundingBox.js";

export interface IPdfPathSegment {
  readonly index: number;
  readonly operator: string;
  readonly boundingBox: IBoundingBox;
}
