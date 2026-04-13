// code.ts
// core-design-pattern-quad-tree-abstract
// Revised contract-only module.
// No concrete quad tree insertion, split, traversal, or storage implementation.

export type QuadTreeCoordinate = number;

export interface IQuadTreePoint {
  readonly x: QuadTreeCoordinate;
  readonly y: QuadTreeCoordinate;
}

export interface IQuadTreeSize {
  readonly width: number;
  readonly height: number;
}

export interface IQuadTreeBounds extends IQuadTreePoint, IQuadTreeSize {}

export interface IQuadTreeItemEnvelope<TItem> {
  readonly item: TItem;
  readonly bounds: IQuadTreeBounds;
}

export interface IQuadTreeBoundsProvider<TItem> {
  getBounds(item: TItem): IQuadTreeBounds;
}

export interface IQuadTreeQueryRegion {
  intersects(bounds: IQuadTreeBounds): boolean;
}

export interface IQuadTreeSplitPolicyInput {
  readonly depth: number;
  readonly itemCount: number;
  readonly totalItemCount: number;
  readonly totalNodeCount: number;
  readonly hasChildren: boolean;
  readonly nodeBounds: IQuadTreeBounds;
}

export interface IQuadTreeSplitPolicy {
  shouldSplit(input: IQuadTreeSplitPolicyInput): boolean;
}

export interface IQuadTreeInsertPolicyInput<TItem> {
  readonly depth: number;
  readonly totalItemCount: number;
  readonly totalNodeCount: number;
  readonly hasChildren: boolean;
  readonly nodeBounds: IQuadTreeBounds;
  readonly item: TItem;
  readonly itemBounds: IQuadTreeBounds;
}

export interface IQuadTreeInsertPolicy<TItem> {
  canInsert(input: IQuadTreeInsertPolicyInput<TItem>): boolean;
}

export interface IQuadTreeMergePolicyInput {
  readonly depth: number;
  readonly itemCount: number;
  readonly childCount: number;
  readonly totalItemCount: number;
  readonly totalNodeCount: number;
  readonly hasChildren: boolean;
  readonly nodeBounds: IQuadTreeBounds;
}

export interface IQuadTreeMergePolicy {
  shouldMerge(input: IQuadTreeMergePolicyInput): boolean;
}

export interface IQuadTreeQuery<TItem> {
  matches(input: IQuadTreeQueryMatchInput<TItem>): boolean;
}

export interface IQuadTreeQueryMatchInput<TItem> {
  readonly item: TItem;
  readonly itemBounds: IQuadTreeBounds;
  readonly region: IQuadTreeQueryRegion;
}

export interface IQuadTreeVisitor<TItem> {
  visitNode(node: IQuadTreeNode<TItem>): void;
  visitItem(envelope: IQuadTreeItemEnvelope<TItem>): void;
}

export interface IQuadTreeVisitFilter<TItem> {
  shouldVisitNode(node: IQuadTreeNode<TItem>): boolean;
  shouldVisitItem(envelope: IQuadTreeItemEnvelope<TItem>): boolean;
}

export interface IQuadTreeNode<TItem> {
  readonly bounds: IQuadTreeBounds;
  readonly depth: number;
  readonly items: readonly IQuadTreeItemEnvelope<TItem>[];
  readonly children: readonly IQuadTreeNode<TItem>[];

  isLeaf(): boolean;
  hasChildren(): boolean;
}

export interface IQuadTreeStatistics {
  readonly depth: number;
  readonly nodeCount: number;
  readonly leafCount: number;
  readonly itemCount: number;
}

export interface IQuadTreeInsertResult<TItem> {
  readonly inserted: boolean;
  readonly item: TItem;
  readonly reason?: string;
}

export interface IQuadTreeRemoveResult<TItem> {
  readonly removed: boolean;
  readonly item: TItem;
  readonly reason?: string;
}

export interface IQuadTreeClearResult {
  readonly clearedItemCount: number;
}

export interface IQuadTreeOptions<TItem> {
  readonly maxDepth: number;
  readonly maxItemsPerNode: number;
  readonly splitPolicy?: IQuadTreeSplitPolicy;
  readonly mergePolicy?: IQuadTreeMergePolicy;
  readonly insertPolicy?: IQuadTreeInsertPolicy<TItem>;
}

export interface ICreateQuadTreeInput<TItem> {
  readonly rootBounds: IQuadTreeBounds;
  readonly boundsProvider: IQuadTreeBoundsProvider<TItem>;
  readonly options: IQuadTreeOptions<TItem>;
}

export interface IQuadTreeFactory<TItem> {
  create(input: ICreateQuadTreeInput<TItem>): IQuadTree<TItem>;
}

export interface IQuadTree<TItem> {
  readonly root: IQuadTreeNode<TItem>;
  readonly boundsProvider: IQuadTreeBoundsProvider<TItem>;
  readonly options: IQuadTreeOptions<TItem>;

  insert(item: TItem): IQuadTreeInsertResult<TItem>;
  insertMany(items: readonly TItem[]): readonly IQuadTreeInsertResult<TItem>[];

  remove(item: TItem): IQuadTreeRemoveResult<TItem>;
  clear(): IQuadTreeClearResult;

  query(region: IQuadTreeQueryRegion): readonly TItem[];
  queryEnvelopes(region: IQuadTreeQueryRegion): readonly IQuadTreeItemEnvelope<TItem>[];
  queryWith(
    query: IQuadTreeQuery<TItem>,
    region: IQuadTreeQueryRegion,
  ): readonly TItem[];

  contains(item: TItem): boolean;
  count(): number;
  getStatistics(): IQuadTreeStatistics;

  visit(
    visitor: IQuadTreeVisitor<TItem>,
    filter?: IQuadTreeVisitFilter<TItem>,
  ): void;
}

// Optional capability contract.
// Keep nearest-neighbor out of the base IQuadTree<TItem>.
export interface IQuadTreeNearestSearch<TItem> {
  nearest(point: IQuadTreePoint, maxDistance: number): readonly TItem[];
}

// -----------------------------------------------------------------------------
// Shared immutable value objects
// -----------------------------------------------------------------------------

export class QuadTreePoint implements IQuadTreePoint {
  public readonly x: QuadTreeCoordinate;
  public readonly y: QuadTreeCoordinate;

  public constructor(x: QuadTreeCoordinate, y: QuadTreeCoordinate) {
    QuadTreeGuard.againstNonFiniteNumber(x, "x");
    QuadTreeGuard.againstNonFiniteNumber(y, "y");

    this.x = x;
    this.y = y;

    Object.freeze(this);
  }
}

export class QuadTreeSize implements IQuadTreeSize {
  public readonly width: number;
  public readonly height: number;

  public constructor(width: number, height: number) {
    QuadTreeGuard.againstNegativeNumber(width, "width");
    QuadTreeGuard.againstNegativeNumber(height, "height");

    this.width = width;
    this.height = height;

    Object.freeze(this);
  }
}

export class QuadTreeBounds implements IQuadTreeBounds {
  public readonly x: QuadTreeCoordinate;
  public readonly y: QuadTreeCoordinate;
  public readonly width: number;
  public readonly height: number;

  public constructor(
    x: QuadTreeCoordinate,
    y: QuadTreeCoordinate,
    width: number,
    height: number,
  ) {
    QuadTreeGuard.againstNonFiniteNumber(x, "x");
    QuadTreeGuard.againstNonFiniteNumber(y, "y");
    QuadTreeGuard.againstNegativeNumber(width, "width");
    QuadTreeGuard.againstNegativeNumber(height, "height");

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    Object.freeze(this);
  }

  public get left(): number {
    return this.x;
  }

  public get top(): number {
    return this.y;
  }

  public get right(): number {
    return this.x + this.width;
  }

  public get bottom(): number {
    return this.y + this.height;
  }
}

export class QuadTreeRectangleQueryRegion implements IQuadTreeQueryRegion {
  public readonly bounds: IQuadTreeBounds;

  public constructor(bounds: IQuadTreeBounds) {
    QuadTreeGuard.againstNullOrUndefined(bounds, "bounds");
    this.bounds = bounds;
    Object.freeze(this);
  }

  public intersects(bounds: IQuadTreeBounds): boolean {
    return QuadTreeBoundsOperations.intersects(this.bounds, bounds);
  }
}

export class QuadTreeItemEnvelope<TItem> implements IQuadTreeItemEnvelope<TItem> {
  public readonly item: TItem;
  public readonly bounds: IQuadTreeBounds;

  public constructor(item: TItem, bounds: IQuadTreeBounds) {
    QuadTreeGuard.againstNullOrUndefined(item, "item");
    QuadTreeGuard.againstNullOrUndefined(bounds, "bounds");

    this.item = item;
    this.bounds = bounds;

    Object.freeze(this);
  }
}

export class QuadTreeOptions<TItem> implements IQuadTreeOptions<TItem> {
  public readonly maxDepth: number;
  public readonly maxItemsPerNode: number;
  public readonly splitPolicy?: IQuadTreeSplitPolicy;
  public readonly mergePolicy?: IQuadTreeMergePolicy;
  public readonly insertPolicy?: IQuadTreeInsertPolicy<TItem>;

  public constructor(input: IQuadTreeOptions<TItem>) {
    QuadTreeGuard.againstNullOrUndefined(input, "input");
    QuadTreeGuard.againstNegativeNumber(input.maxDepth, "maxDepth");
    QuadTreeGuard.againstNumberLessThanOne(
      input.maxItemsPerNode,
      "maxItemsPerNode",
    );

    this.maxDepth = input.maxDepth;
    this.maxItemsPerNode = input.maxItemsPerNode;
    this.splitPolicy = input.splitPolicy;
    this.mergePolicy = input.mergePolicy;
    this.insertPolicy = input.insertPolicy;

    Object.freeze(this);
  }
}

export class QuadTreeStatistics implements IQuadTreeStatistics {
  public readonly depth: number;
  public readonly nodeCount: number;
  public readonly leafCount: number;
  public readonly itemCount: number;

  public constructor(
    depth: number,
    nodeCount: number,
    leafCount: number,
    itemCount: number,
  ) {
    QuadTreeGuard.againstNegativeNumber(depth, "depth");
    QuadTreeGuard.againstNegativeNumber(nodeCount, "nodeCount");
    QuadTreeGuard.againstNegativeNumber(leafCount, "leafCount");
    QuadTreeGuard.againstNegativeNumber(itemCount, "itemCount");

    this.depth = depth;
    this.nodeCount = nodeCount;
    this.leafCount = leafCount;
    this.itemCount = itemCount;

    Object.freeze(this);
  }
}

export class QuadTreeInsertResult<TItem> implements IQuadTreeInsertResult<TItem> {
  public readonly inserted: boolean;
  public readonly item: TItem;
  public readonly reason?: string;

  public constructor(inserted: boolean, item: TItem, reason?: string) {
    QuadTreeGuard.againstNullOrUndefined(item, "item");

    this.inserted = inserted;
    this.item = item;
    this.reason = reason;

    Object.freeze(this);
  }
}

export class QuadTreeRemoveResult<TItem> implements IQuadTreeRemoveResult<TItem> {
  public readonly removed: boolean;
  public readonly item: TItem;
  public readonly reason?: string;

  public constructor(removed: boolean, item: TItem, reason?: string) {
    QuadTreeGuard.againstNullOrUndefined(item, "item");

    this.removed = removed;
    this.item = item;
    this.reason = reason;

    Object.freeze(this);
  }
}

export class QuadTreeClearResult implements IQuadTreeClearResult {
  public readonly clearedItemCount: number;

  public constructor(clearedItemCount: number) {
    QuadTreeGuard.againstNegativeNumber(clearedItemCount, "clearedItemCount");
    this.clearedItemCount = clearedItemCount;
    Object.freeze(this);
  }
}

// -----------------------------------------------------------------------------
// Pure helpers
// -----------------------------------------------------------------------------

export class QuadTreeGuard {
  public static againstNullOrUndefined<TValue>(
    value: TValue,
    name: string,
  ): asserts value is NonNullable<TValue> {
    if (value === null || value === undefined) {
      throw new Error(`Argument '${name}' must not be null or undefined.`);
    }
  }

  public static againstNonFiniteNumber(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`Argument '${name}' must be a finite number.`);
    }
  }

  public static againstNegativeNumber(value: number, name: string): void {
    this.againstNonFiniteNumber(value, name);

    if (value < 0) {
      throw new Error(`Argument '${name}' must be greater than or equal to 0.`);
    }
  }

  public static againstNumberLessThanOne(value: number, name: string): void {
    this.againstNonFiniteNumber(value, name);

    if (value < 1) {
      throw new Error(`Argument '${name}' must be greater than or equal to 1.`);
    }
  }
}

export class QuadTreeBoundsOperations {
  public static contains(
    container: IQuadTreeBounds,
    content: IQuadTreeBounds,
  ): boolean {
    return (
      content.x >= container.x &&
      content.y >= container.y &&
      content.x + content.width <= container.x + container.width &&
      content.y + content.height <= container.y + container.height
    );
  }

  public static intersects(
    left: IQuadTreeBounds,
    right: IQuadTreeBounds,
  ): boolean {
    return !(
      left.x + left.width < right.x ||
      right.x + right.width < left.x ||
      left.y + left.height < right.y ||
      right.y + right.height < left.y
    );
  }

  public static containsPoint(
    bounds: IQuadTreeBounds,
    point: IQuadTreePoint,
  ): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  public static getCenter(bounds: IQuadTreeBounds): IQuadTreePoint {
    return new QuadTreePoint(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
  }

  public static subdivide(bounds: IQuadTreeBounds): readonly IQuadTreeBounds[] {
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;

    return Object.freeze([
      new QuadTreeBounds(bounds.x, bounds.y, halfWidth, halfHeight),
      new QuadTreeBounds(bounds.x + halfWidth, bounds.y, halfWidth, halfHeight),
      new QuadTreeBounds(bounds.x, bounds.y + halfHeight, halfWidth, halfHeight),
      new QuadTreeBounds(
        bounds.x + halfWidth,
        bounds.y + halfHeight,
        halfWidth,
        halfHeight,
      ),
    ]);
  }
}

export class QuadTreeEnvelopeFactory<TItem> {
  private readonly boundsProvider: IQuadTreeBoundsProvider<TItem>;

  public constructor(boundsProvider: IQuadTreeBoundsProvider<TItem>) {
    QuadTreeGuard.againstNullOrUndefined(boundsProvider, "boundsProvider");
    this.boundsProvider = boundsProvider;
  }

  public create(item: TItem): IQuadTreeItemEnvelope<TItem> {
    const bounds = this.boundsProvider.getBounds(item);
    return new QuadTreeItemEnvelope(item, bounds);
  }

  public createMany(
    items: readonly TItem[],
  ): readonly IQuadTreeItemEnvelope<TItem>[] {
    return Object.freeze(items.map((item) => this.create(item)));
  }
}