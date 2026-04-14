import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";
import type { PdfBoundingBoxClusteringResult } from "./PdfBoundingBoxClusteringResult.js";

export interface IPdfBoundingBoxClusterer {
  cluster(
    boxes: readonly IPdfBoundingBox[],
    eps: number,
    minPts: number,
  ): PdfBoundingBoxClusteringResult;
}
