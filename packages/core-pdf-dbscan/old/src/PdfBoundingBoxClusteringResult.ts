import { IBoundingBox } from "@monorepo/core-pdf-common";
import { PdfBoundingBoxCluster } from "./PdfBoundingBoxCluster.js";

export class PdfBoundingBoxClusteringResult {
  public readonly clusters: readonly PdfBoundingBoxCluster[];
  public readonly noise: readonly IBoundingBox[];

  public constructor(
    clusters: readonly PdfBoundingBoxCluster[],
    noise: readonly IBoundingBox[],
  ) {
    this.clusters = Object.freeze([...clusters]);
    this.noise = Object.freeze([...noise]);
    Object.freeze(this);
  }
}
