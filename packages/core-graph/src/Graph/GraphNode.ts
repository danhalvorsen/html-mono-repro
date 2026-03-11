import type { IGraphNode } from "./Nodes/IGraphNode.js";

export class GraphNode implements IGraphNode {
  constructor(
    public id: string,
    public payload: unknown = null
  ) { }
}  

