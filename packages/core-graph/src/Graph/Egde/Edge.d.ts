import type { IGraphNode } from "../Nodes/IGraphNode.js";
export interface IEdge {
    source: IGraphNode;
    target: IGraphNode;
}
export declare class Edge implements IEdge {
    source: IGraphNode;
    target: IGraphNode;
    constructor(source: IGraphNode, target: IGraphNode);
}
//# sourceMappingURL=Edge.d.ts.map