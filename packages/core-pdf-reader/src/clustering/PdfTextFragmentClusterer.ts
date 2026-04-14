// packages/core-pdf-reader/src/clustering/PdfTextFragmentClusterer.ts

import { BoundingBox2D, Vector2, BoundingBox2DBuilder } from '@monorepo/core-math';
import type { IPdfTextFragment } from "../IPdfTextFragment.js";

export interface ITextFragmentBoundingBoxFactory {
  create(fragment: IPdfTextFragment): BoundingBox2D;
}

export interface ITextFragmentLineRule {
  shouldGroup(left: IPdfTextFragment, right: IPdfTextFragment): boolean;
}

export interface ITextFragmentClusterer {
  cluster(
    fragments: readonly IPdfTextFragment[],
  ): readonly (readonly IPdfTextFragment[])[];
}

export interface ITextFragmentCluster {
  readonly fragments: readonly IPdfTextFragment[];
  readonly boundingBox: BoundingBox2D;
  canAccept(fragment: IPdfTextFragment): boolean;
  add(fragment: IPdfTextFragment): void;
}

export class PdfTextFragmentBoundingBoxFactory implements ITextFragmentBoundingBoxFactory {
  public create(fragment: IPdfTextFragment): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(fragment.x, fragment.y),
      new Vector2(fragment.x + fragment.width, fragment.y + fragment.height),
    );
  }
}

export class PdfTextFragmentLineRule implements ITextFragmentLineRule {
  public constructor(
    private readonly boundingBoxFactory: ITextFragmentBoundingBoxFactory,
    private readonly minVerticalOverlapRatio: number = 0.5,
    private readonly minHeightSimilarityRatio: number = 0.5,
    private readonly maxHorizontalGapFactor: number = 4,
    private readonly maxCenterDistanceFactor: number = 3,
  ) {}

  public shouldGroup(left: IPdfTextFragment, right: IPdfTextFragment): boolean {
    const a = this.boundingBoxFactory.create(left);
    const b = this.boundingBoxFactory.create(right);

    const verticalOverlapRatio = this.calculateVerticalOverlapRatio(a, b);
    const heightSimilarityRatio = this.calculateHeightSimilarityRatio(a, b);
    const horizontalGap = this.calculateHorizontalGap(a, b);
    const centerDistanceX = this.calculateCenterDistanceX(a, b);

    const maxHeight = Math.max(a.height(), b.height());
    const maxWidth = Math.max(a.width(), b.width());

    return (
      verticalOverlapRatio >= this.minVerticalOverlapRatio &&
      heightSimilarityRatio >= this.minHeightSimilarityRatio &&
      horizontalGap <= maxHeight * this.maxHorizontalGapFactor &&
      centerDistanceX <= maxWidth * this.maxCenterDistanceFactor
    );
  }

  private calculateVerticalOverlapRatio(a: BoundingBox2D, b: BoundingBox2D): number {
    const overlap = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);
    if (overlap <= 0) {
      return 0;
    }

    return overlap / Math.min(a.height(), b.height());
  }

  private calculateHeightSimilarityRatio(a: BoundingBox2D, b: BoundingBox2D): number {
    return Math.min(a.height(), b.height()) / Math.max(a.height(), b.height());
  }

  private calculateHorizontalGap(a: BoundingBox2D, b: BoundingBox2D): number {
    if (b.minX >= a.maxX) {
      return b.minX - a.maxX;
    }

    if (a.minX >= b.maxX) {
      return a.minX - b.maxX;
    }

    return 0;
  }

  private calculateCenterDistanceX(a: BoundingBox2D, b: BoundingBox2D): number {
    return Math.abs(a.center().x - b.center().x);
  }
}

export class PdfTextFragmentCluster implements ITextFragmentCluster {
  private readonly _fragments: IPdfTextFragment[];
  private _boundingBox: BoundingBox2D;

  public constructor(
    seed: IPdfTextFragment,
    private readonly lineRule: ITextFragmentLineRule,
    private readonly boundingBoxFactory: ITextFragmentBoundingBoxFactory,
  ) {
    this._fragments = [seed];
    this._boundingBox = this.boundingBoxFactory.create(seed);
  }

  public get fragments(): readonly IPdfTextFragment[] {
    return Object.freeze([...this._fragments]);
  }

  public get boundingBox(): BoundingBox2D {
    return this._boundingBox;
  }

  public canAccept(fragment: IPdfTextFragment): boolean {
    const first = this._fragments[0];
    const last = this._fragments[this._fragments.length - 1];

    if (first === undefined || last === undefined) {
      return false;
    }

    const representative = this.createRepresentativeFragment();

    return (
      this.lineRule.shouldGroup(first, fragment) &&
      this.lineRule.shouldGroup(last, fragment) &&
      this.lineRule.shouldGroup(representative, fragment)
    );
  }

  public add(fragment: IPdfTextFragment): void {
    this._fragments.push(fragment);
    this._fragments.sort((a, b) => a.x - b.x);
    this._boundingBox = this.buildBoundingBox(this._fragments);
  }

  private createRepresentativeFragment(): IPdfTextFragment {
    const bounds = this._boundingBox;

    return Object.freeze({
      pageNumber: this._fragments[0]!.pageNumber,
      text: "__cluster__",
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.width(),
      height: bounds.height(),
    });
  }

  private buildBoundingBox(
    fragments: readonly IPdfTextFragment[],
  ): BoundingBox2D {
    const builder = new BoundingBox2DBuilder();

    for (const fragment of fragments) {
      const box = this.boundingBoxFactory.create(fragment);
      builder.add(box.min);
      builder.add(box.max);
    }

    return builder.build();
  }
}

export class PdfTextFragmentClusterer implements ITextFragmentClusterer {
  public constructor(
    private readonly lineRule: ITextFragmentLineRule,
    private readonly boundingBoxFactory: ITextFragmentBoundingBoxFactory,
    private readonly rowTolerance: number = 2,
  ) {}

  public cluster(
    fragments: readonly IPdfTextFragment[],
  ): readonly (readonly IPdfTextFragment[])[] {
    const sorted = this.sortFragments(fragments);
    const clusters: PdfTextFragmentCluster[] = [];

    for (const fragment of sorted) {
      const target = this.findAcceptingCluster(clusters, fragment);

      if (target !== undefined) {
        target.add(fragment);
        continue;
      }

      clusters.push(
        new PdfTextFragmentCluster(
          fragment,
          this.lineRule,
          this.boundingBoxFactory,
        ),
      );
    }

    return Object.freeze(
      clusters
        .map((cluster) => Object.freeze([...cluster.fragments]))
        .sort((a, b) => this.compareClusters(a, b)),
    );
  }

  private findAcceptingCluster(
    clusters: readonly PdfTextFragmentCluster[],
    fragment: IPdfTextFragment,
  ): PdfTextFragmentCluster | undefined {
    let best: PdfTextFragmentCluster | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const cluster of clusters) {
      if (!this.isNearClusterRow(cluster, fragment)) {
        continue;
      }

      if (!cluster.canAccept(fragment)) {
        continue;
      }

      const distance = this.calculateHorizontalDistanceToCluster(cluster, fragment);
      if (distance < bestDistance) {
        best = cluster;
        bestDistance = distance;
      }
    }

    return best;
  }

  private isNearClusterRow(
    cluster: PdfTextFragmentCluster,
    fragment: IPdfTextFragment,
  ): boolean {
    const clusterCenterY = cluster.boundingBox.center().y;
    const fragmentCenterY = fragment.y + fragment.height / 2;
    return Math.abs(clusterCenterY - fragmentCenterY) <= this.rowTolerance + Math.max(cluster.boundingBox.height(), fragment.height);
  }

  private calculateHorizontalDistanceToCluster(
    cluster: PdfTextFragmentCluster,
    fragment: IPdfTextFragment,
  ): number {
    const clusterBox = cluster.boundingBox;
    const fragmentLeft = fragment.x;
    const fragmentRight = fragment.x + fragment.width;

    if (fragmentLeft >= clusterBox.maxX) {
      return fragmentLeft - clusterBox.maxX;
    }

    if (clusterBox.minX >= fragmentRight) {
      return clusterBox.minX - fragmentRight;
    }

    return 0;
  }

  private sortFragments(
    fragments: readonly IPdfTextFragment[],
  ): readonly IPdfTextFragment[] {
    return Object.freeze(
      [...fragments].sort((a, b) => {
        const dy = b.y - a.y;
        if (Math.abs(dy) > this.rowTolerance) {
          return dy;
        }

        return a.x - b.x;
      }),
    );
  }

  private compareClusters(
    left: readonly IPdfTextFragment[],
    right: readonly IPdfTextFragment[],
  ): number {
    const leftTop = Math.max(...left.map((x) => x.y));
    const rightTop = Math.max(...right.map((x) => x.y));
    const dy = rightTop - leftTop;

    if (Math.abs(dy) > this.rowTolerance) {
      return dy;
    }

    const leftMinX = Math.min(...left.map((x) => x.x));
    const rightMinX = Math.min(...right.map((x) => x.x));
    return leftMinX - rightMinX;
  }
}