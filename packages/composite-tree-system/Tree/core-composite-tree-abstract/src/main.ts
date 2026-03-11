/* ============================================================================
   core-composite-tree-abstract
   Single-snippet version
   Backwards-compatible public API
   ============================================================================ */

/* ============================================================================
   INode.ts
   ============================================================================ */

export interface INode<TNode extends INode<TNode>> {
  readonly id: string;
  readonly parent: TNode | null;
  readonly children: readonly TNode[];
}

/* ============================================================================
   ICompositeNode.ts
   ============================================================================ */

export interface ICompositeNode<TNode extends INode<TNode>> extends INode<TNode> {
  add(child: TNode): void;
  remove(child: TNode): void;
  contains(child: TNode): boolean;
}

/* ============================================================================
   errors
   ============================================================================ */

export class TreeError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EmptyNodeIdError extends TreeError {
  public constructor() {
    super("Node id cannot be empty.");
  }
}

export class NodeSelfReferenceError extends TreeError {
  public constructor(nodeId: string) {
    super(`Cannot add node '${nodeId}' to itself.`);
  }
}

export class NodeAlreadyHasParentError extends TreeError {
  public constructor(nodeId: string) {
    super(`Child '${nodeId}' already has a parent.`);
  }
}

export class NodeAlreadyExistsError extends TreeError {
  public constructor(nodeId: string) {
    super(`Child '${nodeId}' already exists.`);
  }
}

export class TreeCycleError extends TreeError {
  public constructor(parentId: string, childId: string) {
    super(`Cannot add ancestor '${childId}' beneath '${parentId}'.`);
  }
}

/* ============================================================================
   NodeBase.ts
   ============================================================================ */

export abstract class NodeBase<TNode extends INode<TNode>> implements INode<TNode> {
  private _parent: TNode | null = null;

  protected constructor(public readonly id: string) {
    if (id.trim().length === 0) {
      throw new EmptyNodeIdError();
    }
  }

  public get parent(): TNode | null {
    return this._parent;
  }

  public abstract get children(): readonly TNode[];

  /**
   * Internal mutation method for use by composite nodes.
   */
  public setParent(parent: TNode | null): void {
    this._parent = parent;
  }
}

/* ============================================================================
   LeafNode.ts
   ============================================================================ */

const EMPTY_CHILDREN: readonly unknown[] = Object.freeze([]);

export abstract class LeafNode<TNode extends INode<TNode>> extends NodeBase<TNode> {
  protected constructor(id: string) {
    super(id);
  }

  public get children(): readonly TNode[] {
    return EMPTY_CHILDREN as readonly TNode[];
  }
}

/* ============================================================================
   CompositeNode.ts
   ============================================================================ */

export abstract class CompositeNode<TNode extends INode<TNode>>
  extends NodeBase<TNode>
  implements ICompositeNode<TNode> {
  private readonly _children: TNode[] = [];

  protected constructor(id: string, initialChildren: readonly TNode[] = []) {
    super(id);

    for (const child of initialChildren) {
      this.add(child);
    }
  }

  public get children(): readonly TNode[] {
    return this._children;
  }

  public contains(child: TNode): boolean {
    return this._children.includes(child);
  }

  public add(child: TNode): void {
    this.ensureCanAdd(child);

    this._children.push(child);
    this.setChildParent(child, this.self());
  }

  public remove(child: TNode): void {
    const index = this._children.indexOf(child);
    if (index < 0) {
      return;
    }

    this._children.splice(index, 1);
    this.setChildParent(child, null);
  }

  /**
   * Open for extension, closed for modification.
   * Derived composite nodes can strengthen invariants.
   */
  protected ensureCanAdd(child: TNode): void {
    if (child === this.self()) {
      throw new NodeSelfReferenceError(this.id);
    }

    if (child.parent !== null) {
      throw new NodeAlreadyHasParentError(child.id);
    }

    if (this.contains(child)) {
      throw new NodeAlreadyExistsError(child.id);
    }

    if (this.wouldCreateCycle(child)) {
      throw new TreeCycleError(this.id, child.id);
    }
  }

  private wouldCreateCycle(candidateAncestor: TNode): boolean {
    let current: TNode | null = this.self();

    while (current !== null) {
      if (current === candidateAncestor) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  private setChildParent(child: TNode, parent: TNode | null): void {
    const mutableChild = child as unknown as NodeBase<TNode>;
    mutableChild.setParent(parent);
  }

  private self(): TNode {
    return this as unknown as TNode;
  }
}