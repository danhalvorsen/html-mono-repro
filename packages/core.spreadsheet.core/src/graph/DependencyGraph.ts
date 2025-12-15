import { IDependencyGraph, NodeId } from "./IDependencyGraph.js";

export class DependencyGraph implements IDependencyGraph {
    private readonly dependents = new Map<NodeId, Set<NodeId>>();
    private readonly precedents = new Map<NodeId, Set<NodeId>>();

    addNode(id: NodeId): void {
        if (!this.dependents.has(id)) this.dependents.set(id, new Set());
        if (!this.precedents.has(id)) this.precedents.set(id, new Set());
    }

    removeNode(id: NodeId): void {
        this.dependents.delete(id);
        this.precedents.delete(id);

        for (const set of this.dependents.values()) set.delete(id);
        for (const set of this.precedents.values()) set.delete(id);
    }

    addDependency(from: NodeId, to: NodeId): void {
        this.addNode(from);
        this.addNode(to);
        this.dependents.get(from)!.add(to);
        this.precedents.get(to)!.add(from);
    }

    removeDependency(from: NodeId, to: NodeId): void {
        this.dependents.get(from)?.delete(to);
        this.precedents.get(to)?.delete(from);
    }

    getDependents(id: NodeId): ReadonlySet<NodeId> {
        return this.dependents.get(id) ?? new Set();
    }

    getPrecedents(id: NodeId): ReadonlySet<NodeId> {
        return this.precedents.get(id) ?? new Set();
    }

    hasCycle(): boolean {
        const visited = new Set<NodeId>();
        const stack = new Set<NodeId>();

        const dfs = (node: NodeId): boolean => {
            if (stack.has(node)) return true;
            if (visited.has(node)) return false;

            visited.add(node);
            stack.add(node);

            for (const next of this.getDependents(node)) {
                if (dfs(next)) return true;
            }

            stack.delete(node);
            return false;
        };

        for (const node of this.dependents.keys()) {
            if (dfs(node)) return true;
        }
        return false;
    }

    topologicalSort(start: NodeId): NodeId[] {
        const visited = new Set<NodeId>();
        const result: NodeId[] = [];

        const dfs = (node: NodeId) => {
            if (visited.has(node)) return;
            visited.add(node);

            for (const dep of this.getDependents(node)) dfs(dep);
            result.push(node);
        };

        dfs(start);
        return result;
    }
}
