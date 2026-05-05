import { QuadTreeFactory } from "@monorepo/core-design-pattern-quad-tree";
import {
  QuadTreeBounds,
  QuadTreeRectangleQueryRegion,
  type IQuadTree,
} from "@monorepo/core-design-pattern-quad-tree-abstract";
import {
  FragmentKinds,
  type IFragment,
  type PdfFragment,
} from "@monorepo/core-pdf-domain";

export interface IPdfFragmentCluster<TFragment extends IFragment = PdfFragment> {
  readonly id: string;
  readonly items: readonly TFragment[];
}

export interface IPdfFragmentClusteringResult<TFragment extends IFragment = PdfFragment> {
  readonly clusters: readonly IPdfFragmentCluster<TFragment>[];
  readonly noise: readonly TFragment[];
}

export interface IPdfFragmentDistance<TFragment extends IFragment = IFragment> {
  measure(left: TFragment, right: TFragment): number;
}

interface IPdfFragmentNeighborhoodQuery {
  neighborsOf(index: number): readonly number[];
}

interface IPdfFragmentNeighborhoodQueryFactory {
  create(
    nodes: readonly FragmentNode[],
    eps: number,
    distance: IPdfFragmentDistance<PdfFragment>,
  ): IPdfFragmentNeighborhoodQuery;
}

export interface IDbscanPdfFragmentClustererOptions {
  readonly distance?: IPdfFragmentDistance<PdfFragment>;
}

type FragmentNode = {
  readonly index: number;
  readonly fragment: PdfFragment;
  readonly bounds: QuadTreeBounds;
};

class BoundingBoxDistance implements IPdfFragmentDistance {
  public measure(left: IFragment, right: IFragment): number {
    const dx = this.axisGap(
      left.boundingBox.position.x,
      left.boundingBox.position.x + left.boundingBox.width,
      right.boundingBox.position.x,
      right.boundingBox.position.x + right.boundingBox.width,
    );

    const dy = this.axisGap(
      left.boundingBox.position.y,
      left.boundingBox.position.y + left.boundingBox.height,
      right.boundingBox.position.y,
      right.boundingBox.position.y + right.boundingBox.height,
    );

    return Math.hypot(dx, dy);
  }

  private axisGap(aMin: number, aMax: number, bMin: number, bMax: number): number {
    if (aMax < bMin) return bMin - aMax;
    if (bMax < aMin) return aMin - bMax;
    return 0;
  }
}

class QuadTreeNeighborhoodQueryFactory
  implements IPdfFragmentNeighborhoodQueryFactory {
  public create(
    nodes: readonly FragmentNode[],
    eps: number,
    distance: IPdfFragmentDistance<PdfFragment>,
  ): IPdfFragmentNeighborhoodQuery {
    return new QuadTreeNeighborhoodQuery(nodes, eps, distance);
  }
}

class QuadTreeNeighborhoodQuery implements IPdfFragmentNeighborhoodQuery {
  private readonly pageIndices: ReadonlyMap<number, PageNeighborhoodIndex>;

  public constructor(
    private readonly nodes: readonly FragmentNode[],
    eps: number,
    distance: IPdfFragmentDistance<PdfFragment>,
  ) {
    this.pageIndices = this.createPageIndices(nodes, eps, distance);
  }

  public neighborsOf(index: number): readonly number[] {
    const node = this.nodes[index];

    if (node === undefined) {
      throw new Error(`Fragment index '${index}' is out of range.`);
    }

    const pageIndex = this.pageIndices.get(node.fragment.pageNumber);

    if (pageIndex === undefined) {
      throw new Error(
        `Missing neighborhood index for page '${node.fragment.pageNumber}'.`,
      );
    }

    return pageIndex.neighborsOf(node.index);
  }

  private createPageIndices(
    nodes: readonly FragmentNode[],
    eps: number,
    distance: IPdfFragmentDistance<PdfFragment>,
  ): ReadonlyMap<number, PageNeighborhoodIndex> {
    const nodesByPage = new Map<number, FragmentNode[]>();

    for (const node of nodes) {
      const pageNodes = nodesByPage.get(node.fragment.pageNumber);

      if (pageNodes === undefined) {
        nodesByPage.set(node.fragment.pageNumber, [node]);
      } else {
        pageNodes.push(node);
      }
    }

    return new Map(
      Array.from(nodesByPage.entries()).map(([pageNumber, pageNodes]) => [
        pageNumber,
        new PageNeighborhoodIndex(pageNodes, eps, distance),
      ]),
    );
  }
}

class PageNeighborhoodIndex {
  private readonly tree: IQuadTree<FragmentNode>;
  private readonly nodeByIndex: ReadonlyMap<number, FragmentNode>;
  private readonly neighborCache = new Map<number, readonly number[]>();

  public constructor(
    nodes: readonly FragmentNode[],
    private readonly eps: number,
    private readonly distance: IPdfFragmentDistance<PdfFragment>,
  ) {
    this.nodeByIndex = new Map(nodes.map((node) => [node.index, node]));
    this.tree = new QuadTreeFactory<FragmentNode>().create({
      rootBounds: this.createRootBounds(nodes),
      boundsProvider: {
        getBounds: (node) => node.bounds,
      },
      options: {
        maxDepth: 8,
        maxItemsPerNode: 16,
      },
    });

    this.tree.insertMany(nodes);
  }

  public neighborsOf(index: number): readonly number[] {
    const cached = this.neighborCache.get(index);

    if (cached !== undefined) {
      return cached;
    }

    const node = this.nodeByIndex.get(index);

    if (node === undefined) {
      return Object.freeze([]);
    }

    const region = new QuadTreeRectangleQueryRegion(
      new QuadTreeBounds(
        node.bounds.x - this.eps,
        node.bounds.y - this.eps,
        node.bounds.width + this.eps * 2,
        node.bounds.height + this.eps * 2,
      ),
    );

    const neighbors = this.tree
      .query(region)
      .filter(
        (candidate) =>
          this.distance.measure(node.fragment, candidate.fragment)
            <= this.eps,
      )
      .map((candidate) => candidate.index);

    if (!neighbors.includes(index)) {
      neighbors.push(index);
    }

    const frozen = Object.freeze(
      neighbors.sort((left, right) => left - right),
    );
    this.neighborCache.set(index, frozen);

    return frozen;
  }

  private createRootBounds(nodes: readonly FragmentNode[]): QuadTreeBounds {
    if (nodes.length === 0) {
      return new QuadTreeBounds(0, 0, 1, 1);
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const node of nodes) {
      minX = Math.min(minX, node.bounds.x);
      minY = Math.min(minY, node.bounds.y);
      maxX = Math.max(maxX, node.bounds.x + node.bounds.width);
      maxY = Math.max(maxY, node.bounds.y + node.bounds.height);
    }

    return new QuadTreeBounds(
      minX,
      minY,
      Math.max(1, maxX - minX),
      Math.max(1, maxY - minY),
    );
  }
}

export class DbscanPdfFragmentClusterer {
  private readonly distance: IPdfFragmentDistance<PdfFragment>;
  private readonly neighborhoodQueryFactory: IPdfFragmentNeighborhoodQueryFactory =
    new QuadTreeNeighborhoodQueryFactory();

  public constructor(options: IDbscanPdfFragmentClustererOptions = {}) {
    this.distance = options.distance ?? new BoundingBoxDistance();
  }

  public cluster(
    fragments: readonly PdfFragment[],
    eps: number,
    minPts: number,
  ): IPdfFragmentClusteringResult {
    this.validate(eps, minPts);
    fragments.forEach((fragment, index) => this.validateFragment(fragment, index));

    if (fragments.length === 0) {
      return this.createResult([], []);
    }

    const orderedNodes = this.buildOrderedNodes(fragments);
    const neighborhoodQuery = this.neighborhoodQueryFactory.create(
      orderedNodes,
      eps,
      this.distance,
    );

    const visited = new Uint8Array(orderedNodes.length);
    const noise = new Uint8Array(orderedNodes.length);
    const assignedClusterId = new Int32Array(orderedNodes.length);
    assignedClusterId.fill(-1);

    const clusterIndices = [] as number[][];

    for (let seedIndex = 0; seedIndex < orderedNodes.length; seedIndex += 1) {
      if (visited[seedIndex] === 1) {
        continue;
      }

      visited[seedIndex] = 1;
      const neighbors = neighborhoodQuery.neighborsOf(seedIndex);

      if (neighbors.length < minPts) {
        noise[seedIndex] = 1;
        continue;
      }

      const clusterId = clusterIndices.length;
      const cluster = [] as number[];
      clusterIndices.push(cluster);

      this.expandCluster(
        seedIndex,
        neighbors,
        neighborhoodQuery,
        minPts,
        orderedNodes.length,
        visited,
        assignedClusterId,
        noise,
        clusterId,
        cluster,
      );
    }

    const clusters = Object.freeze(
      clusterIndices.map((indices, clusterIndex) => ({
        id: `cluster-${clusterIndex + 1}`,
        items: Object.freeze(
          indices
            .slice()
            .sort((left, right) => left - right)
            .map((nodeIndex) => orderedNodes[nodeIndex]!.fragment),
        ),
      })),
    );

    const outliers = [] as PdfFragment[];

    for (let index = 0; index < orderedNodes.length; index += 1) {
      if (noise[index] === 1 && assignedClusterId[index] === -1) {
        outliers.push(orderedNodes[index]!.fragment);
      }
    }

    return this.createResult(clusters, outliers);
  }

  private expandCluster(
    seedIndex: number,
    seedNeighbors: readonly number[],
    neighborhoodQuery: IPdfFragmentNeighborhoodQuery,
    minPts: number,
    nodeCount: number,
    visited: Uint8Array,
    assignedClusterId: Int32Array,
    noise: Uint8Array,
    clusterId: number,
    cluster: number[],
  ): void {
    const queue = seedNeighbors.slice() as number[];
    const inQueue = new Uint8Array(nodeCount);

    for (const index of queue) {
      inQueue[index] = 1;
    }

    this.assign(seedIndex, clusterId, assignedClusterId, noise, cluster);

    for (let pointer = 0; pointer < queue.length; pointer += 1) {
      const currentIndex = queue[pointer]!;

      if (visited[currentIndex] === 0) {
        visited[currentIndex] = 1;

        const nextNeighbors = neighborhoodQuery.neighborsOf(currentIndex);

        if (nextNeighbors.length >= minPts) {
          for (const neighborIndex of nextNeighbors) {
            if (inQueue[neighborIndex] === 0) {
              inQueue[neighborIndex] = 1;
              queue.push(neighborIndex);
            }
          }
        }
      }

      if (assignedClusterId[currentIndex] === -1) {
        this.assign(currentIndex, clusterId, assignedClusterId, noise, cluster);
      }
    }
  }

  private assign(
    index: number,
    clusterId: number,
    assignedClusterId: Int32Array,
    noise: Uint8Array,
    cluster: number[],
  ): void {
    assignedClusterId[index] = clusterId;
    noise[index] = 0;
    cluster.push(index);
  }

  private buildOrderedNodes(fragments: readonly PdfFragment[]): readonly FragmentNode[] {
    const ordered = fragments
      .map((fragment, index) => ({ fragment, index }))
      .sort((left, right) =>
        this.compareFragments(left.fragment, right.fragment, left.index, right.index),
      );

    return Object.freeze(
      ordered.map(({ fragment }, index) => ({
        index,
        fragment,
        bounds: new QuadTreeBounds(
          fragment.boundingBox.position.x,
          fragment.boundingBox.position.y,
          fragment.boundingBox.width,
          fragment.boundingBox.height,
        ),
      })),
    );
  }

  private compareFragments(
    left: PdfFragment,
    right: PdfFragment,
    leftIndex: number,
    rightIndex: number,
  ): number {
    if (left.pageNumber !== right.pageNumber) {
      return left.pageNumber - right.pageNumber;
    }

    const byY = left.boundingBox.position.y - right.boundingBox.position.y;
    if (byY !== 0) {
      return byY;
    }

    const byX = left.boundingBox.position.x - right.boundingBox.position.x;
    if (byX !== 0) {
      return byX;
    }

    const byHeight = left.boundingBox.height - right.boundingBox.height;
    if (byHeight !== 0) {
      return byHeight;
    }

    const byWidth = left.boundingBox.width - right.boundingBox.width;
    if (byWidth !== 0) {
      return byWidth;
    }

    const byKind = left.kind.localeCompare(right.kind);
    if (byKind !== 0) {
      return byKind;
    }

    if (left.kind === FragmentKinds.Text && right.kind === FragmentKinds.Text) {
      const byText = left.text.localeCompare(right.text);
      if (byText !== 0) {
        return byText;
      }
    }

    return leftIndex - rightIndex;
  }

  private createResult(
    clusters: readonly IPdfFragmentCluster<PdfFragment>[],
    noise: readonly PdfFragment[],
  ): IPdfFragmentClusteringResult<PdfFragment> {
    return Object.freeze({
      clusters: Object.freeze(clusters.slice()),
      noise: Object.freeze(noise.slice()),
    });
  }

  private validate(eps: number, minPts: number): void {
    if (!Number.isFinite(eps) || eps < 0) {
      throw new Error("eps must be >= 0");
    }

    if (!Number.isInteger(minPts) || minPts < 1) {
      throw new Error("minPts must be >= 1");
    }
  }

  private validateFragment(fragment: PdfFragment, index: number): void {
    if (!Number.isInteger(fragment.pageNumber) || fragment.pageNumber < 1) {
      throw new Error(`fragments[${index}].pageNumber must be an integer >= 1.`);
    }

    if (
      fragment.kind !== FragmentKinds.Text
      && fragment.kind !== FragmentKinds.Image
      && fragment.kind !== FragmentKinds.Rectangle
      && fragment.kind !== FragmentKinds.Path
    ) {
      throw new Error(`fragments[${index}].kind is invalid.`);
    }

    if (fragment.kind === FragmentKinds.Text && typeof fragment.text !== "string") {
      throw new Error(`fragments[${index}].text must be a string for kind 'text'.`);
    }

    const box = fragment.boundingBox;
    if (
      !Number.isFinite(box.position.x)
      || !Number.isFinite(box.position.y)
      || !Number.isFinite(box.width)
      || !Number.isFinite(box.height)
    ) {
      throw new Error(`fragments[${index}].boundingBox must contain finite numbers.`);
    }

    if (box.width < 0 || box.height < 0) {
      throw new Error(`fragments[${index}].boundingBox size must be >= 0.`);
    }
  }
}
