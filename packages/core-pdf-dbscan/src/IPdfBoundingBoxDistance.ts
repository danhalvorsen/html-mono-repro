import { IBoundingBox } from "@monorepo/core-pdf-common";
export interface IPdfBoundingBoxDistance {
  measure(left: IBoundingBox, right: IBoundingBox): number;
}
