import type { INode } from "@monorepo/core-composite-tree-abstract";

import { CompositeNode, LeafNode } from "@monorepo/core-composite-tree-abstract";

export interface INodeVisitor<TNode extends INode<TNode>> {
  enter(node: TNode): void;
  leave(node: TNode): void;
}

export abstract class NodeVisitorBase<TNode extends INode<TNode>>
  implements INodeVisitor<TNode> {
  public enter(_node: TNode): void {}
  public leave(_node: TNode): void {}
}

export interface ITraversalStrategy<TNode extends INode<TNode>> {
  traverse(root: TNode, visitor: INodeVisitor<TNode>): void;
}

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

export class DepthFirstTraversalStrategy<TNode extends INode<TNode>>
  implements ITraversalStrategy<TNode> {
  public traverse(root: TNode, visitor: INodeVisitor<TNode>): void {
    this.visit(root, visitor);
  }

  private visit(node: TNode, visitor: INodeVisitor<TNode>): void {
    visitor.enter(node);

    for (const child of node.children) {
      this.visit(child, visitor);
    }

    visitor.leave(node);
  }
}

export class BreadthFirstTraversalStrategy<TNode extends INode<TNode>>
  implements ITraversalStrategy<TNode> {
  public traverse(root: TNode, visitor: INodeVisitor<TNode>): void {
    const queue: TNode[] = [root];

    while (queue.length > 0) {
      const node = queue.shift();
      if (node === undefined) {
        return;
      }

      visitor.enter(node);

      for (const child of node.children) {
        queue.push(child);
      }

      visitor.leave(node);
    }
  }
}

export class FindFirstVisitor<TNode extends INode<TNode>>
  extends NodeVisitorBase<TNode> {
  private resultNode: TNode | null = null;

  public constructor(
    private readonly predicate: (node: TNode) => boolean
  ) {
    super();
  }

  public override enter(node: TNode): void {
    if (this.resultNode !== null) {
      return;
    }

    if (this.predicate(node)) {
      this.resultNode = node;
    }
  }

  public get result(): TNode | null {
    return this.resultNode;
  }
}

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

export class RecordingVisitor<TNode extends INode<TNode>>
  extends NodeVisitorBase<TNode> {
  private readonly enteredNodes: TNode[] = [];
  private readonly leftNodes: TNode[] = [];

  public override enter(node: TNode): void {
    this.enteredNodes.push(node);
  }

  public override leave(node: TNode): void {
    this.leftNodes.push(node);
  }

  public get entered(): readonly TNode[] {
    return this.enteredNodes;
  }

  public get left(): readonly TNode[] {
    return this.leftNodes;
  }
}
