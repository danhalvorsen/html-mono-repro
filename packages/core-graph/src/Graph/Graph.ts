 
import { type IEdge } from "./Egde/Edge.js";
import type { IGraph } from "./IGraph.js";
import type { IGraphNode } from "./Nodes/IGraphNode.js";

export class Graph implements IGraph {
  public nodesInternal: IGraphNode[] = [];
  public edgesInternal: IEdge[] = [];

  get nodes(): readonly IGraphNode[] {
    return this.nodesInternal;
  }

  get edges(): readonly IEdge[] {
    return this.edgesInternal;
  }

  addNode(id: string, payload: unknown = null): IGraphNode {
    const node: IGraphNode = { id, payload };
    this.nodesInternal.push(node);
    return node;
  }

  addEdge(source: IGraphNode, target: IGraphNode): IEdge {
    const edge: IEdge = { source, target };
    this.edgesInternal.push(edge);
    return edge;
  }
}

