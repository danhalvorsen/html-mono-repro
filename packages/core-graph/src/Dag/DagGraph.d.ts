import type { IEdge } from "../Graph/Egde/Edge.js";
import { Graph } from "../Graph/Graph.js";
import type { IGraph } from "../Graph/IGraph.js";
import type { IGraphNode } from "../Graph/Nodes/IGraphNode.js";
export interface IDagGraph extends IGraph {
    readonly isAcyclic: boolean;
}
export declare class DagGraph implements IDagGraph {
    private readonly inner;
    get dasInner(): Graph;
    get nodes(): readonly IGraphNode[];
    get edges(): readonly IEdge[];
    get isAcyclic(): boolean;
    addNode(id: string, payload?: unknown): IGraphNode;
    addEdge(s: IGraphNode, t: IGraphNode): IEdge;
}
//# sourceMappingURL=DagGraph.d.ts.map