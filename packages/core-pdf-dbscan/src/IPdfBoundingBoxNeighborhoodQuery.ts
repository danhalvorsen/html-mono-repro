import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";

export interface IPdfBoundingBoxNeighborhoodQuery {
  findNeighbors(
    candidate: IPdfBoundingBox,
    eps: number,
  ): readonly IPdfBoundingBox[];
}
