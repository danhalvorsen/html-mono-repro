export type NodeId = string;

export interface IDependencyGraph {
    addNode(id: NodeId): void;
    removeNode(id: NodeId): void;

    addDependency(from: NodeId, to: NodeId): void;
    removeDependency(from: NodeId, to: NodeId): void;

    getDependents(id: NodeId): ReadonlySet<NodeId>;
    getPrecedents(id: NodeId): ReadonlySet<NodeId>;

    hasCycle(): boolean;
    topologicalSort(from: NodeId): NodeId[];
}
