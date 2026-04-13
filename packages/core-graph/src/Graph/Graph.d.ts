import { type IEdge } from "./Egde/Edge.js";
import type { IGraph } from "./IGraph.js";
import type { IGraphNode } from "./Nodes/IGraphNode.js";
export declare class Graph implements IGraph {
    nodesInternal: IGraphNode[];
    edgesInternal: IEdge[];
    get nodes(): readonly IGraphNode[];
    get edges(): readonly IEdge[];
    addNode(id: string, payload?: unknown): IGraphNode;
    addEdge(source: IGraphNode, target: IGraphNode): IEdge;
}
//# sourceMappingURL=Graph.d.ts.map