/* ============================================================
   OOP Tree Traversal Module
   Depends only on INode<TNode> from core-composition-abstract
   ============================================================ */

export interface INode<TNode extends INode<TNode>> {
  readonly id: string;
  readonly parent: TNode | null;
  readonly children: readonly TNode[];
}

/* ------------------------------------------------------------
   Visitor
   ------------------------------------------------------------ */

export interface INodeVisitor<TNode extends INode<TNode>> {
  enter(node: TNode): void;
  leave(node: TNode): void;
}

/* ------------------------------------------------------------
   Traversal strategy
   ------------------------------------------------------------ */

export interface ITraversalStrategy<TNode extends INode<TNode>> {
  traverse(root: TNode, visitor: INodeVisitor<TNode>): void;
}

/* ------------------------------------------------------------
   Tree walker
   ------------------------------------------------------------ */

export interface ITreeWalker<TNode extends INode<TNode>> {
  walk(root: TNode, visitor: INodeVisitor<TNode>): void;
}

export class TreeWalker<TNode extends INode<TNode>>
  implements ITreeWalker<TNode> {

  public constructor(
    private readonly strategy: ITraversalStrategy<TNode>
  ) {}

  public walk(root: TNode, visitor: INodeVisitor<TNode>): void {
    this.strategy.traverse(root, visitor);
  }
}

/* ============================================================
   Traversal strategies
   ============================================================ */

/* ---------- Depth-first (pre-order) ---------- */

export class DepthFirstTraversalStrategy<TNode extends INode<TNode>>
  implements ITraversalStrategy<TNode> {

  public traverse(root: TNode, visitor: INodeVisitor<TNode>): void {
    visitor.enter(root);

    for (const child of root.children) {
      this.traverse(child, visitor);
    }

    visitor.leave(root);
  }
}

/* ---------- Breadth-first traversal ---------- */

export class BreadthFirstTraversalStrategy<TNode extends INode<TNode>>
  implements ITraversalStrategy<TNode> {

  public traverse(root: TNode, visitor: INodeVisitor<TNode>): void {
    const queue: TNode[] = [root];

    while (queue.length > 0) {
      const node = queue.shift()!;

      visitor.enter(node);

      for (const child of node.children) {
        queue.push(child);
      }

      visitor.leave(node);
    }
  }
}

/* ============================================================
   Reusable visitors
   ============================================================ */

export abstract class NodeVisitorBase<TNode extends INode<TNode>>
  implements INodeVisitor<TNode> {

  public enter(_node: TNode): void {}
  public leave(_node: TNode): void {}
}

/* ---------- Find first matching node ---------- */

export class FindFirstVisitor<TNode extends INode<TNode>>
  extends NodeVisitorBase<TNode> {

  private resultNode: TNode | null = null;

  public constructor(
    private readonly predicate: (node: TNode) => boolean
  ) {
    super();
  }

  public override enter(node: TNode): void {
    if (this.resultNode !== null) return;

    if (this.predicate(node)) {
      this.resultNode = node;
    }
  }

  public get result(): TNode | null {
    return this.resultNode;
  }
}

/* ---------- Collect nodes ---------- */

export class CollectVisitor<TNode extends INode<TNode>>
  extends NodeVisitorBase<TNode> {

  private readonly items: TNode[] = [];

  public constructor(
    private readonly predicate: (node: TNode) => boolean
  ) {
    super();
  }

  public override enter(node: TNode): void {
    if (this.predicate(node)) {
      this.items.push(node);
    }
  }

  public get result(): readonly TNode[] {
    return this.items;
  }
}

/* ============================================================
   Example usage
   ============================================================ */

interface ITreeNode extends INode<ITreeNode> {}

class SimpleNode implements ITreeNode {
  public readonly children: ITreeNode[] = [];

  constructor(
    public readonly id: string,
    public readonly parent: ITreeNode | null = null
  ) {}

  add(child: SimpleNode) {
    this.children.push(child);
  }
}

const root = new SimpleNode("root");
const a = new SimpleNode("A");
const b = new SimpleNode("B");
const c = new SimpleNode("C");

root.add(a);
root.add(b);
a.add(c);

const walker = new TreeWalker<ITreeNode>(
  new DepthFirstTraversalStrategy()
);

const findVisitor = new FindFirstVisitor<ITreeNode>(n => n.id === "C");

walker.walk(root, findVisitor);

console.log(findVisitor.result?.id); // C