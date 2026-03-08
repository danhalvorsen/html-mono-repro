/* ------------------------------------------------------------
   Node contract
   ------------------------------------------------------------ */

export interface INode<TNode extends INode<TNode>> {
  readonly id: string;
  readonly parent: TNode | null;
  readonly children: readonly TNode[];
}
