export interface INodeIdentitySelector<TNode> {
    selectId(node: TNode): string;
}
