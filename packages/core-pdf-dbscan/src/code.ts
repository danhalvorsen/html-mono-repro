// =================================================================================================
// core-pdf-dbscan (domain-aligned)
// =================================================================================================

type IPoint = { readonly x: number; readonly y: number };

type IBoundingBox = {
  readonly position: IPoint;
  readonly width: number;
  readonly height: number;
};

type IPdfFragment = {
  readonly kind: "text" | "image" | "rectangle";
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
};

class PdfFragmentCluster {
  public constructor(
    public readonly id: string,
    public readonly items: readonly IPdfFragment[],
  ) {}
}

class PdfFragmentClusteringResult {
  public constructor(
    public readonly clusters: readonly PdfFragmentCluster[],
    public readonly noise: readonly IPdfFragment[],
  ) {}
}

// =================================================================================================
// Distance (domain geometry only)
// =================================================================================================

class BoundingBoxDistance {
  public measure(a: IBoundingBox, b: IBoundingBox): number {
    const dx = this.axisGap(
      a.position.x,
      a.position.x + a.width,
      b.position.x,
      b.position.x + b.width,
    );

    const dy = this.axisGap(
      a.position.y,
      a.position.y + a.height,
      b.position.y,
      b.position.y + b.height,
    );

    return Math.hypot(dx, dy);
  }

  private axisGap(aMin: number, aMax: number, bMin: number, bMax: number): number {
    if (aMax < bMin) return bMin - aMax;
    if (bMax < aMin) return aMin - bMax;
    return 0;
  }
}

// =================================================================================================
// DBSCAN (no IDs, no infra leakage)
// =================================================================================================

export class DbscanPdfFragmentClusterer {
  private readonly distance = new BoundingBoxDistance();

  public cluster(
    fragments: readonly IPdfFragment[],
    eps: number,
    minPts: number,
  ): PdfFragmentClusteringResult {
    this.validate(eps, minPts);

    const visited = new Set<number>();
    const assigned = new Set<number>();
    const clusters: PdfFragmentCluster[] = [];
    const noise: IPdfFragment[] = [];

    let clusterIndex = 0;

    for (let i = 0; i < fragments.length; i++) {
      if (visited.has(i)) continue;

      visited.add(i);

      const neighbors = this.neighbors(i, fragments, eps);

      if (neighbors.length < minPts) {
        noise.push(fragments[i]!);
        continue;
      }

      clusterIndex++;
      const clusterItems: IPdfFragment[] = [];

      this.expandCluster(
        i,
        neighbors,
        fragments,
        eps,
        minPts,
        visited,
        assigned,
        clusterItems,
      );

      clusters.push(
        new PdfFragmentCluster(`cluster-${clusterIndex}`, clusterItems),
      );
    }

    return new PdfFragmentClusteringResult(clusters, noise);
  }

  private expandCluster(
    seedIndex: number,
    neighbors: number[],
    fragments: readonly IPdfFragment[],
    eps: number,
    minPts: number,
    visited: Set<number>,
    assigned: Set<number>,
    clusterItems: IPdfFragment[],
  ): void {
    const queue = [...neighbors];

    this.assign(seedIndex, fragments, assigned, clusterItems);

    for (let i = 0; i < queue.length; i++) {
      const idx = queue[i]!;

      if (!visited.has(idx)) {
        visited.add(idx);

        const nextNeighbors = this.neighbors(idx, fragments, eps);

        if (nextNeighbors.length >= minPts) {
          for (const n of nextNeighbors) {
            if (!queue.includes(n)) queue.push(n);
          }
        }
      }

      if (!assigned.has(idx)) {
        this.assign(idx, fragments, assigned, clusterItems);
      }
    }
  }

  private assign(
    index: number,
    fragments: readonly IPdfFragment[],
    assigned: Set<number>,
    cluster: IPdfFragment[],
  ): void {
    assigned.add(index);
    cluster.push(fragments[index]!);
  }

  private neighbors(
    index: number,
    fragments: readonly IPdfFragment[],
    eps: number,
  ): number[] {
    const result: number[] = [];

    for (let i = 0; i < fragments.length; i++) {
      const d = this.distance.measure(
        fragments[index]!.boundingBox,
        fragments[i]!.boundingBox,
      );

      if (d <= eps) {
        result.push(i);
      }
    }

    return result;
  }

  private validate(eps: number, minPts: number): void {
    if (!Number.isFinite(eps) || eps < 0) {
      throw new Error("eps must be >= 0");
    }

    if (!Number.isInteger(minPts) || minPts < 1) {
      throw new Error("minPts must be >= 1");
    }
  }
}