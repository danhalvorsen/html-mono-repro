import type { IGraphNode } from "../Nodes/IGraphNode.js";

export interface IEdge {
  source: IGraphNode;
  target: IGraphNode;
}

export class Edge implements IEdge {
  constructor(
    public source: IGraphNode,
    public target: IGraphNode
  ) { }
} // Core.Graph.Impl.CycleDetector.ts

