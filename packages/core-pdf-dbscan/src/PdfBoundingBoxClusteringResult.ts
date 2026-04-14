import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";
import { PdfBoundingBoxCluster } from "./PdfBoundingBoxCluster.js";

export class PdfBoundingBoxClusteringResult {
  public readonly clusters: readonly PdfBoundingBoxCluster[];
  public readonly noise: readonly IPdfBoundingBox[];

  public constructor(
    clusters: readonly PdfBoundingBoxCluster[],
    noise: readonly IPdfBoundingBox[],
  ) {
    this.clusters = Object.freeze([...clusters]);
    this.noise = Object.freeze([...noise]);
    Object.freeze(this);
  }
}
