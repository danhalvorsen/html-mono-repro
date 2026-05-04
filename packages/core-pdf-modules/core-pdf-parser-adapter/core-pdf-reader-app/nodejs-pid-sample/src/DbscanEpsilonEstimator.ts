// src/DbscanEpsilonEstimator.ts

import type { PdfFragment } from "@monorepo/core-pdf-domain";

type CenterPoint = {
  readonly x: number;
  readonly y: number;
};

export type DbscanEpsilonEstimate = {
  readonly fragmentCount: number;
  readonly pointCount: number;
  readonly minSamples: number;
  readonly k: number;
  readonly eps: number;
  readonly kneeIndex: number;
  readonly stats: {
    readonly min: number;
    readonly median: number;
    readonly p75: number;
    readonly p90: number;
    readonly p95: number;
    readonly max: number;
  };
  readonly sortedKDistances: readonly number[];
};

export class DbscanEpsilonEstimator {
  public estimate(
    fragments: readonly PdfFragment[],
    minSamples: number,
  ): DbscanEpsilonEstimate {
    if (fragments.length === 0) {
      throw new Error("No PDF fragments found.");
    }

    if (!Number.isInteger(minSamples) || minSamples < 2) {
      throw new Error("minSamples must be an integer >= 2.");
    }

    const points = fragments.map((fragment) => this.toCenterPoint(fragment));
    const k = minSamples - 1;

    const sortedKDistances = this.getSortedKDistances(points, k);
    const kneeIndex = this.findKneeIndex(sortedKDistances);
    const eps = sortedKDistances[kneeIndex];

    return {
      fragmentCount: fragments.length,
      pointCount: points.length,
      minSamples,
      k,
      eps,
      kneeIndex,
      stats: {
        min: sortedKDistances[0],
        median: this.percentile(sortedKDistances, 0.5),
        p75: this.percentile(sortedKDistances, 0.75),
        p90: this.percentile(sortedKDistances, 0.9),
        p95: this.percentile(sortedKDistances, 0.95),
        max: sortedKDistances[sortedKDistances.length - 1],
      },
      sortedKDistances,
    };
  }

  private toCenterPoint(fragment: PdfFragment): CenterPoint {
    return {
      x: fragment.boundingBox.position.x + fragment.boundingBox.width / 2,
      y: fragment.boundingBox.position.y + fragment.boundingBox.height / 2,
    };
  }

  private getSortedKDistances(
    points: readonly CenterPoint[],
    k: number,
  ): readonly number[] {
    if (points.length <= k) {
      throw new Error("Not enough points for selected minSamples.");
    }

    return points
      .map((point, index) => {
        const distances = points
          .filter((_other, otherIndex) => otherIndex !== index)
          .map((other) => this.distance(point, other))
          .sort((a, b) => a - b);

        return distances[k - 1];
      })
      .sort((a, b) => a - b);
  }

  private distance(a: CenterPoint, b: CenterPoint): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  private findKneeIndex(sortedDistances: readonly number[]): number {
    const lastIndex = sortedDistances.length - 1;

    if (lastIndex <= 0) {
      return 0;
    }

    const minY = sortedDistances[0];
    const maxY = sortedDistances[lastIndex];
    const yRange = maxY - minY;

    if (yRange === 0) {
      return lastIndex;
    }

    let bestIndex = 0;
    let bestDistance = Number.NEGATIVE_INFINITY;

    for (let index = 0; index <= lastIndex; index++) {
      const x = index / lastIndex;
      const y = (sortedDistances[index] - minY) / yRange;
      const distanceFromDiagonal = Math.abs(y - x) / Math.sqrt(2);

      if (distanceFromDiagonal > bestDistance) {
        bestDistance = distanceFromDiagonal;
        bestIndex = index;
      }
    }

    return bestIndex;
  }

  private percentile(sortedValues: readonly number[], percentile: number): number {
    const index = Math.min(
      sortedValues.length - 1,
      Math.max(0, Math.ceil(sortedValues.length * percentile) - 1),
    );

    return sortedValues[index];
  }
}