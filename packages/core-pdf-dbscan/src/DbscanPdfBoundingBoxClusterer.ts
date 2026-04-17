import type { IBoundingBox } from "@monorepo/core-pdf-common";
import type { IPdfBoundingBoxClusterer } from "./IPdfBoundingBoxClusterer.js";
import type { IPdfBoundingBoxNeighborhoodQuery } from "./IPdfBoundingBoxNeighborhoodQuery.js";
import { PdfBoundingBoxCluster } from "./PdfBoundingBoxCluster.js";
import { PdfBoundingBoxClusteringResult } from "./PdfBoundingBoxClusteringResult.js";
import { QuadTreePdfBoundingBoxNeighborhoodQuery } from "./QuadTreePdfBoundingBoxNeighborhoodQuery.js";

export class DbscanPdfBoundingBoxClusterer
  implements IPdfBoundingBoxClusterer
{
  public cluster(
    boxes: readonly IBoundingBox[],
    eps: number,
    minPts: number,
  ): PdfBoundingBoxClusteringResult {
    this.validateParameters(eps, minPts);

    const orderedBoxes = boxes.slice().sort((left, right) => left.id.localeCompare(right.id));
    const neighborhoodQuery = new QuadTreePdfBoundingBoxNeighborhoodQuery(orderedBoxes);
    const visited = new Set<string>();
    const assignedClusterByBoxId = new Map<string, string>();
    const clusters = new Map<string, IBoundingBox[]>();
    const noise = new Set<string>();
    let clusterIndex = 0;

    for (const box of orderedBoxes) {
      if (visited.has(box.id)) {
        continue;
      }

      visited.add(box.id);
      const neighbors = neighborhoodQuery.findNeighbors(box, eps);

      if (neighbors.length < minPts) {
        noise.add(box.id);
        continue;
      }

      clusterIndex += 1;
      const clusterId = `cluster-${clusterIndex}`;
      clusters.set(clusterId, []);
      this.expandCluster(
        box,
        neighbors,
        clusterId,
        eps,
        minPts,
        neighborhoodQuery,
        visited,
        assignedClusterByBoxId,
        noise,
        clusters,
      );
    }

    const clusterResults = Array.from(clusters.entries())
      .map(([id, items]) => new PdfBoundingBoxCluster(id, items))
      .sort((left, right) => left.id.localeCompare(right.id));

    const noiseResults = orderedBoxes.filter(
      (box) => noise.has(box.id) && !assignedClusterByBoxId.has(box.id),
    );

    return new PdfBoundingBoxClusteringResult(clusterResults, noiseResults);
  }

  private expandCluster(
    seed: IBoundingBox,
    seedNeighbors: readonly IBoundingBox[],
    clusterId: string,
    eps: number,
    minPts: number,
    neighborhoodQuery: IPdfBoundingBoxNeighborhoodQuery,
    visited: Set<string>,
    assignedClusterByBoxId: Map<string, string>,
    noise: Set<string>,
    clusters: Map<string, IBoundingBox[]>,
  ): void {
    const queue = seedNeighbors.slice();
    this.assignToCluster(seed, clusterId, assignedClusterByBoxId, noise, clusters);

    for (let index = 0; index < queue.length; index += 1) {
      const candidate = queue[index]!;

      if (!visited.has(candidate.id)) {
        visited.add(candidate.id);
        const candidateNeighbors = neighborhoodQuery.findNeighbors(candidate, eps);

        if (candidateNeighbors.length >= minPts) {
          this.mergeNeighbors(queue, candidateNeighbors);
        }
      }

      if (!assignedClusterByBoxId.has(candidate.id)) {
        this.assignToCluster(
          candidate,
          clusterId,
          assignedClusterByBoxId,
          noise,
          clusters,
        );
      }
    }
  }

  private assignToCluster(
    box: IBoundingBox,
    clusterId: string,
    assignedClusterByBoxId: Map<string, string>,
    noise: Set<string>,
    clusters: Map<string, IBoundingBox[]>,
  ): void {
    assignedClusterByBoxId.set(box.id, clusterId);
    noise.delete(box.id);

    const cluster = clusters.get(clusterId)!;

    if (!cluster.some((item) => item.id === box.id)) {
      cluster.push(box);
      cluster.sort((left, right) => left.id.localeCompare(right.id));
    }
  }

  private mergeNeighbors(
    queue: IBoundingBox[],
    additional: readonly IBoundingBox[],
  ): void {
    const known = new Set(queue.map((item) => item.id));

    for (const item of additional) {
      if (!known.has(item.id)) {
        queue.push(item);
        known.add(item.id);
      }
    }

    queue.sort((left, right) => left.id.localeCompare(right.id));
  }

  private validateParameters(eps: number, minPts: number): void {
    if (!Number.isFinite(eps) || eps < 0) {
      throw new Error("eps must be a finite number greater than or equal to zero.");
    }

    if (!Number.isInteger(minPts) || minPts < 1) {
      throw new Error("minPts must be an integer greater than or equal to one.");
    }
  }
}
