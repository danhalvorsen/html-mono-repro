import { IGraphNode } from "./index.js";

export class GraphNode implements IGraphNode {
  constructor(
    public id: string,
    public payload: unknown = null
  ) { }
}  

