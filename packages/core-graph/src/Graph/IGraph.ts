 
import { type IEdge } from "./Egde/Edge.js";
import type { IGraphNode } from "./Nodes/IGraphNode.js";

export interface IGraph {
  readonly nodes: readonly IGraphNode[];
  readonly edges: readonly IEdge[];

  addNode(id: string, payload?: unknown): IGraphNode;
  addEdge(source: IGraphNode, target: IGraphNode): IEdge;
}
