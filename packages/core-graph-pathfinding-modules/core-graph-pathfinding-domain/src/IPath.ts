
export interface IPath<TNodeId> {
    readonly nodes: readonly TNodeId[];
    readonly totalCost: number;
}
