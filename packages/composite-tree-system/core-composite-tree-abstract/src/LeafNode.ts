import { INode } from "./INode.js";
import { NodeBase } from "./NodeBase.js";

/* ------------------------------------------------------------
   Leaf node base
   ------------------------------------------------------------ */

export abstract class LeafNode<TNode extends INode<TNode>>
  extends NodeBase<TNode> {
  protected constructor(id: string) {
    super(id);
  }

  public get children(): readonly TNode[] {
    return [];
  }
}
