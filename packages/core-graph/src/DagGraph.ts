import { CycleDetector } from "./CycleDetector.js";
import { IEdge } from "./Edge.js";
import { IGraph, Graph } from "./Graph.js";
import { IGraphNode } from "./IGraphNode.js";

export interface IDagGraph extends IGraph {
  readonly isAcyclic: boolean;
}

export class DagGraph implements IDagGraph {
  private readonly inner = new Graph();

  get dasInner() :Graph {
    return  this.inner;
  }

  get nodes(): readonly IGraphNode[] {
    return this.inner.nodes;
  }

  get edges(): readonly IEdge[] {
    return this.inner.edges;
  }

  get isAcyclic(): boolean {
    return !CycleDetector.containsCycle(this);
  }

  addNode(id: string, payload: unknown = null): IGraphNode {
    return this.inner.addNode(id, payload);
  }

  addEdge(s: IGraphNode, t: IGraphNode): IEdge {
    const e = this.inner.addEdge(s, t);

    if (!this.isAcyclic) {
      (this.inner.edgesInternal as IEdge[]).pop();
      throw new Error(`Cycle detected adding ${s.id}->${t.id}`);
    }

    return e;
  }
}