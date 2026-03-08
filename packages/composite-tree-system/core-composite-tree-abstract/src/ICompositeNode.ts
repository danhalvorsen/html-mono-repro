import { INode } from "./INode.js";

/* ------------------------------------------------------------
   Composite contract
   ------------------------------------------------------------ */

export interface ICompositeNode<TNode extends INode<TNode>> extends INode<TNode> {
  add(child: TNode): void;
  remove(child: TNode): void;
  contains(child: TNode): boolean;
}
