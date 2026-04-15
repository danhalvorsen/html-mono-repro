import type {
  IQuadTree,
  IQuadTreeNode,
  IQuadTreeBoundsProvider,
  IQuadTreeOptions,
  IQuadTreeInsertResult,
  IQuadTreeRemoveResult,
  IQuadTreeClearResult,
  IQuadTreeQueryRegion,
  IQuadTreeItemEnvelope,
  IQuadTreeQuery,
  IQuadTreeVisitor,
  IQuadTreeVisitFilter,
  IQuadTreeStatistics,
  IQuadTreeSplitPolicy,
  IQuadTreeMergePolicy,
  IQuadTreeInsertPolicy,
  IQuadTreeBounds,
} from '@monorepo/core-design-pattern-quad-tree-abstract';
import {
  QuadTreeBoundsOperations,
  QuadTreeEnvelopeFactory,
  QuadTreeGuard,
  QuadTreeInsertResult,
  QuadTreeRemoveResult,
  QuadTreeClearResult,
  QuadTreeStatistics,
} from '@monorepo/core-design-pattern-quad-tree-abstract';
import { QuadTreeNode } from './QuadTreeNode.js';
import { QueryExecutor } from './traversal/QueryExecutor.js';
import { VisitorExecutor } from './traversal/VisitorExecutor.js';

export class QuadTree<TItem> implements IQuadTree<TItem> {
  private readonly _root: QuadTreeNode<TItem>;
  public readonly boundsProvider: IQuadTreeBoundsProvider<TItem>;
  public readonly options: IQuadTreeOptions<TItem>;

  private readonly _splitPolicy: IQuadTreeSplitPolicy;
  private readonly _mergePolicy: IQuadTreeMergePolicy;
  private readonly _insertPolicy: IQuadTreeInsertPolicy<TItem>;
  private readonly _envelopeFactory: QuadTreeEnvelopeFactory<TItem>;
  private readonly _queryExecutor: QueryExecutor<TItem>;
  private readonly _visitorExecutor: VisitorExecutor<TItem>;

  private _totalItemCount: number;
  private _totalNodeCount: number;

  public get root(): IQuadTreeNode<TItem> {
    return this._root;
  }

  public constructor(
    root: QuadTreeNode<TItem>,
    boundsProvider: IQuadTreeBoundsProvider<TItem>,
    options: IQuadTreeOptions<TItem>,
    splitPolicy: IQuadTreeSplitPolicy,
    mergePolicy: IQuadTreeMergePolicy,
    insertPolicy: IQuadTreeInsertPolicy<TItem>,
  ) {
    QuadTreeGuard.againstNullOrUndefined(root, 'root');
    QuadTreeGuard.againstNullOrUndefined(boundsProvider, 'boundsProvider');
    QuadTreeGuard.againstNullOrUndefined(options, 'options');
    QuadTreeGuard.againstNullOrUndefined(splitPolicy, 'splitPolicy');
    QuadTreeGuard.againstNullOrUndefined(mergePolicy, 'mergePolicy');
    QuadTreeGuard.againstNullOrUndefined(insertPolicy, 'insertPolicy');
    this._root = root;
    this.boundsProvider = boundsProvider;
    this.options = options;
    this._splitPolicy = splitPolicy;
    this._mergePolicy = mergePolicy;
    this._insertPolicy = insertPolicy;
    this._envelopeFactory = new QuadTreeEnvelopeFactory(boundsProvider);
    this._queryExecutor = new QueryExecutor();
    this._visitorExecutor = new VisitorExecutor();
    this._totalItemCount = 0;
    this._totalNodeCount = 1;
  }

  public insert(item: TItem): IQuadTreeInsertResult<TItem> {
    const envelope = this._envelopeFactory.create(item);

    if (!QuadTreeBoundsOperations.contains(this._root.bounds, envelope.bounds)) {
      return new QuadTreeInsertResult(false, item, 'Item bounds are outside the root bounds');
    }

    const inserted = this.insertEnvelope(this._root, envelope);
    if (!inserted) {
      return new QuadTreeInsertResult(false, item, 'Insert policy rejected item');
    }

    this._totalItemCount++;
    return new QuadTreeInsertResult(true, item);
  }

  public insertMany(items: readonly TItem[]): readonly IQuadTreeInsertResult<TItem>[] {
    return Object.freeze(items.map(item => this.insert(item)));
  }

  public remove(item: TItem): IQuadTreeRemoveResult<TItem> {
    const bounds = this.boundsProvider.getBounds(item);
    const removed = this.removeFromNode(this._root, item, bounds);
    if (removed) {
      this._totalItemCount--;
      return new QuadTreeRemoveResult(true, item);
    }
    return new QuadTreeRemoveResult(false, item, 'Item not found');
  }

  public clear(): IQuadTreeClearResult {
    const count = this._totalItemCount;
    this._root.setItems([]);
    this._root.clearChildren();
    this._totalItemCount = 0;
    this._totalNodeCount = 1;
    return new QuadTreeClearResult(count);
  }

  public query(region: IQuadTreeQueryRegion): readonly TItem[] {
    return this._queryExecutor.query(this._root, region);
  }

  public queryEnvelopes(region: IQuadTreeQueryRegion): readonly IQuadTreeItemEnvelope<TItem>[] {
    return this._queryExecutor.queryEnvelopes(this._root, region);
  }

  public queryWith(
    query: IQuadTreeQuery<TItem>,
    region: IQuadTreeQueryRegion,
  ): readonly TItem[] {
    return this._queryExecutor.queryWith(this._root, query, region);
  }

  public contains(item: TItem): boolean {
    const bounds = this.boundsProvider.getBounds(item);
    return this.findItem(this._root, item, bounds);
  }

  public count(): number {
    return this._totalItemCount;
  }

  public getStatistics(): IQuadTreeStatistics {
    let nodeCount = 0;
    let leafCount = 0;
    let maxDepth = 0;

    const traverse = (node: IQuadTreeNode<TItem>): void => {
      nodeCount++;
      if (node.depth > maxDepth) {
        maxDepth = node.depth;
      }
      if (node.isLeaf()) {
        leafCount++;
      }
      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(this._root);
    return new QuadTreeStatistics(maxDepth, nodeCount, leafCount, this._totalItemCount);
  }

  public visit(
    visitor: IQuadTreeVisitor<TItem>,
    filter?: IQuadTreeVisitFilter<TItem>,
  ): void {
    this._visitorExecutor.visit(this._root, visitor, filter);
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  // Returns false when insertPolicy rejects insertion at the target node.
  // Policy is evaluated once, at the node where the item will actually be stored
  // (leaf or first ancestor whose bounds do not fully contain a child quadrant).
  // Items redistributed during split bypass this check — they are already admitted.
  private insertEnvelope(
    node: QuadTreeNode<TItem>,
    envelope: IQuadTreeItemEnvelope<TItem>,
  ): boolean {
    if (node.hasChildren()) {
      const target = this.findChildForEnvelope(node, envelope);
      if (target !== null) {
        return this.insertEnvelope(target, envelope);
      }
    }

    if (!this._insertPolicy.canInsert({
      depth: node.depth,
      totalItemCount: this._totalItemCount,
      totalNodeCount: this._totalNodeCount,
      hasChildren: node.hasChildren(),
      nodeBounds: node.bounds,
      item: envelope.item,
      itemBounds: envelope.bounds,
    })) {
      return false;
    }

    node.addItem(envelope);

    if (this.shouldSplitNode(node)) {
      this.splitNode(node);
    }

    return true;
  }

  private findChildForEnvelope(
    node: QuadTreeNode<TItem>,
    envelope: IQuadTreeItemEnvelope<TItem>,
  ): QuadTreeNode<TItem> | null {
    for (const child of node.getChildNodes()) {
      if (QuadTreeBoundsOperations.contains(child.bounds, envelope.bounds)) {
        return child;
      }
    }
    return null;
  }

  private shouldSplitNode(node: QuadTreeNode<TItem>): boolean {
    return this._splitPolicy.shouldSplit({
      depth: node.depth,
      itemCount: node.getItemsList().length,
      totalItemCount: this._totalItemCount,
      totalNodeCount: this._totalNodeCount,
      hasChildren: node.hasChildren(),
      nodeBounds: node.bounds,
    });
  }

  private splitNode(node: QuadTreeNode<TItem>): void {
    const quadrantBounds = QuadTreeBoundsOperations.subdivide(node.bounds);
    const children = quadrantBounds.map(b => new QuadTreeNode<TItem>(b, node.depth + 1));
    node.setChildren(children);
    this._totalNodeCount += 4;

    // Redistribute items: move each item into the single child that fully contains it.
    // insertPolicy is intentionally bypassed here — these items are already admitted.
    const remaining: IQuadTreeItemEnvelope<TItem>[] = [];
    for (const envelope of node.getItemsList()) {
      let placed = false;
      for (const child of children) {
        if (QuadTreeBoundsOperations.contains(child.bounds, envelope.bounds)) {
          child.addItem(envelope);
          placed = true;
          break;
        }
      }
      if (!placed) {
        remaining.push(envelope);
      }
    }
    node.setItems(remaining);

    // Recursively split any child that is already over-capacity.
    for (const child of children) {
      if (this.shouldSplitNode(child)) {
        this.splitNode(child);
      }
    }
  }

  private removeFromNode(node: QuadTreeNode<TItem>, item: TItem, bounds: IQuadTreeBounds): boolean {
    if (!QuadTreeBoundsOperations.intersects(node.bounds, bounds)) {
      return false;
    }
    // Identity: reference equality (===). Callers must pass the same object instance
    // that was inserted. Value-based equality requires an IQuadTreeItemEqualityComparer.
    const index = node.getItemsList().findIndex(e => e.item === item);
    if (index >= 0) {
      node.removeItemAt(index);
      return true;
    }

    for (const child of node.getChildNodes()) {
      if (this.removeFromNode(child, item, bounds)) {
        this.tryMergeNode(node);
        return true;
      }
    }

    return false;
  }

  private tryMergeNode(node: QuadTreeNode<TItem>): void {
    if (!node.hasChildren()) {
      return;
    }

    // Only merge when all children are leaves (no grandchildren).
    const anyChildHasChildren = node.getChildNodes().some(c => c.hasChildren());
    if (anyChildHasChildren) {
      return;
    }

    const totalChildItems = node.getChildNodes().reduce((sum, c) => sum + c.getItemsList().length, 0);

    const shouldMerge = this._mergePolicy.shouldMerge({
      depth: node.depth,
      itemCount: node.getItemsList().length + totalChildItems, // post-merge occupancy count
      childCount: node.children.length,
      totalItemCount: this._totalItemCount,            // tree-global total
      totalNodeCount: this._totalNodeCount,
      hasChildren: node.hasChildren(),
      nodeBounds: node.bounds,
    });

    if (!shouldMerge) {
      return;
    }

    for (const child of node.getChildNodes()) {
      for (const envelope of child.getItemsList()) {
        node.addItem(envelope);
      }
    }

    this._totalNodeCount -= node.children.length;
    node.clearChildren();
  }

  private findItem(node: IQuadTreeNode<TItem>, item: TItem, bounds: IQuadTreeBounds): boolean {
    if (!QuadTreeBoundsOperations.intersects(node.bounds, bounds)) {
      return false;
    }
    // Identity: reference equality — see removeFromNode comment.
    for (const envelope of node.items) {
      if (envelope.item === item) {
        return true;
      }
    }
    for (const child of node.children) {
      if (this.findItem(child, item, bounds)) {
        return true;
      }
    }
    return false;
  }
}
