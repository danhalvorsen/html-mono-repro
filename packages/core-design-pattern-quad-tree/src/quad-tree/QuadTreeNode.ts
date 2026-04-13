// QuadTreeNode.ts — internal, not exported from index
import type {
  IQuadTreeBounds,
  IQuadTreeItemEnvelope,
  IQuadTreeNode,
} from '@monorepo/core-design-pattern-quad-tree-abstract';

export class QuadTreeNode<TItem> implements IQuadTreeNode<TItem> {
  public readonly bounds: IQuadTreeBounds;
  public readonly depth: number;

  private _items: IQuadTreeItemEnvelope<TItem>[];
  private _children: QuadTreeNode<TItem>[];

  public constructor(bounds: IQuadTreeBounds, depth: number) {
    this.bounds = bounds;
    this.depth = depth;
    this._items = [];
    this._children = [];
  }

  // Returns a frozen snapshot — callers observing this collection across mutations
  // will not see live changes. Use getItemsList() internally for mutable access.
  public get items(): readonly IQuadTreeItemEnvelope<TItem>[] {
    return Object.freeze([...this._items]);
  }

  // Returns a frozen snapshot of current children at call time.
  public get children(): readonly IQuadTreeNode<TItem>[] {
    return Object.freeze([...this._children]);
  }

  // Internal fast-path: returns the live backing array (no copy).
  public getItemsList(): IQuadTreeItemEnvelope<TItem>[] {
    return this._items;
  }

  public isLeaf(): boolean {
    return this._children.length === 0;
  }

  public hasChildren(): boolean {
    return this._children.length > 0;
  }

  public addItem(envelope: IQuadTreeItemEnvelope<TItem>): void {
    this._items.push(envelope);
  }

  public removeItemAt(index: number): void {
    this._items.splice(index, 1);
  }

  public setItems(items: IQuadTreeItemEnvelope<TItem>[]): void {
    this._items = items;
  }

  public setChildren(children: QuadTreeNode<TItem>[]): void {
    this._children = children;
  }

  public clearChildren(): void {
    this._children = [];
  }

  // Internal fast-path: returns the live backing child array (no copy).
  public getChildNodes(): QuadTreeNode<TItem>[] {
    return this._children;
  }
}
