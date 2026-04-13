import type {
  IQuadTreeNode,
  IQuadTreeQueryRegion,
  IQuadTreeItemEnvelope,
  IQuadTreeQuery,
} from '@monorepo/core-design-pattern-quad-tree-abstract';

export class QueryExecutor<TItem> {
  public query(
    root: IQuadTreeNode<TItem>,
    region: IQuadTreeQueryRegion,
  ): readonly TItem[] {
    return Object.freeze(this.queryEnvelopes(root, region).map(e => e.item));
  }

  public queryEnvelopes(
    root: IQuadTreeNode<TItem>,
    region: IQuadTreeQueryRegion,
  ): readonly IQuadTreeItemEnvelope<TItem>[] {
    const result: IQuadTreeItemEnvelope<TItem>[] = [];
    this.traverse(root, region, result);
    return Object.freeze(result);
  }

  public queryWith(
    root: IQuadTreeNode<TItem>,
    query: IQuadTreeQuery<TItem>,
    region: IQuadTreeQueryRegion,
  ): readonly TItem[] {
    const envelopes = this.queryEnvelopes(root, region);
    return Object.freeze(
      envelopes
        .filter(e => query.matches({ item: e.item, itemBounds: e.bounds, region }))
        .map(e => e.item),
    );
  }

  private traverse(
    node: IQuadTreeNode<TItem>,
    region: IQuadTreeQueryRegion,
    result: IQuadTreeItemEnvelope<TItem>[],
  ): void {
    if (!region.intersects(node.bounds)) {
      return;
    }

    for (const envelope of node.items) {
      if (region.intersects(envelope.bounds)) {
        result.push(envelope);
      }
    }

    for (const child of node.children) {
      this.traverse(child, region, result);
    }
  }
}
