import { IBoundingBox } from "@monorepo/core-pdf-common";

export interface IPdfBoundingBoxNeighborhoodQuery {
  findNeighbors(
    candidate: IBoundingBox,
    eps: number,
  ): readonly IBoundingBox[];
}
