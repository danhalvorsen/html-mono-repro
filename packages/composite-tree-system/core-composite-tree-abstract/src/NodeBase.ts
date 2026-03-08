import { INode } from "./INode.js";

/* ------------------------------------------------------------
   Base node implementation
   ------------------------------------------------------------ */

export abstract class NodeBase<TNode extends INode<TNode>>
  implements INode<TNode> {
  private parentNode: TNode | null = null;

  protected constructor(public readonly id: string) {
    if (id.trim().length === 0) {
      throw new Error("Node id cannot be empty.");
    }
  }

  public get parent(): TNode | null {
    return this.parentNode;
  }

  public abstract get children(): readonly TNode[];

  protected setParent(parent: TNode | null): void {
    this.parentNode = parent;
  }
}
