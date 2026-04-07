import { Graph } from "../Graph/Graph.js";
import { CycleDetector } from "./CycleDetector.js";
export class DagGraph {
    inner = new Graph();
    get dasInner() {
        return this.inner;
    }
    get nodes() {
        return this.inner.nodes;
    }
    get edges() {
        return this.inner.edges;
    }
    get isAcyclic() {
        return !CycleDetector.containsCycle(this);
    }
    addNode(id, payload = null) {
        return this.inner.addNode(id, payload);
    }
    addEdge(s, t) {
        const e = this.inner.addEdge(s, t);
        if (!this.isAcyclic) {
            this.inner.edgesInternal.pop();
            throw new Error(`Cycle detected adding ${s.id}->${t.id}`);
        }
        return e;
    }
}
//# sourceMappingURL=DagGraph.js.map