import type {
  IQuadTreeNode,
  IQuadTreeVisitor,
  IQuadTreeVisitFilter,
} from '@monorepo/core-design-pattern-quad-tree-abstract';

export class VisitorExecutor<TItem> {
  public visit(
    root: IQuadTreeNode<TItem>,
    visitor: IQuadTreeVisitor<TItem>,
    filter?: IQuadTreeVisitFilter<TItem>,
  ): void {
    this.traverse(root, visitor, filter);
  }

  private traverse(
    node: IQuadTreeNode<TItem>,
    visitor: IQuadTreeVisitor<TItem>,
    filter?: IQuadTreeVisitFilter<TItem>,
  ): void {
    if (filter !== undefined && !filter.shouldVisitNode(node)) {
      return;
    }

    visitor.visitNode(node);

    for (const envelope of node.items) {
      if (filter === undefined || filter.shouldVisitItem(envelope)) {
        visitor.visitItem(envelope);
      }
    }

    for (const child of node.children) {
      this.traverse(child, visitor, filter);
    }
  }
}
