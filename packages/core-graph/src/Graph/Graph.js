export class Graph {
    nodesInternal = [];
    edgesInternal = [];
    get nodes() {
        return this.nodesInternal;
    }
    get edges() {
        return this.edgesInternal;
    }
    addNode(id, payload = null) {
        const node = { id, payload };
        this.nodesInternal.push(node);
        return node;
    }
    addEdge(source, target) {
        const edge = { source, target };
        this.edgesInternal.push(edge);
        return edge;
    }
}
//# sourceMappingURL=Graph.js.map