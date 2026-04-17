import type { IBoundingBox } from "@monorepo/core-pdf-common";
import type { PdfBoundingBoxClusteringResult } from "./PdfBoundingBoxClusteringResult.js";

export interface IPdfBoundingBoxClusterer {
  cluster(
    boxes: readonly IBoundingBox[],
    eps: number,
    minPts: number,
  ): PdfBoundingBoxClusteringResult;
}
