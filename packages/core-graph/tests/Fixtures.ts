// packages/core-graph/tests/fixtures.ts

import { DagGraph, Graph, GraphNode, type IGraphNode } from "../src/index.js";

export class GraphFixture {
  public createGraph(): Graph {
    return new Graph();
  }

  public createDag(): DagGraph {
    return new DagGraph();
  }

  public createNode(id: string, payload: unknown = null): GraphNode {
    return new GraphNode(id, payload);
  }

  public createGraphWithNodes(...ids: string[]): {
    graph: Graph;
    nodes: Record<string, IGraphNode>;
  } {
    const graph = new Graph();
    const nodes = Object.fromEntries(
      ids.map((id) => [id, graph.addNode(id)])
    ) as Record<string, IGraphNode>;

    return { graph, nodes };
  }

  public createDagWithNodes(...ids: string[]): {
    graph: DagGraph;
    nodes: Record<string, IGraphNode>;
  } {
    const graph = new DagGraph();
    const nodes = Object.fromEntries(
      ids.map((id) => [id, graph.addNode(id)])
    ) as Record<string, IGraphNode>;

    return { graph, nodes };
  }

  public createDagChain(length: number): {
    graph: DagGraph;
    nodes: IGraphNode[];
  } {
    const graph = new DagGraph();
    const nodes = Array.from({ length }, (_, i) => graph.addNode(`N${i}`));

    for (let i = 0; i < nodes.length - 1; i++) {
      graph.addEdge(nodes[i], nodes[i + 1]);
    }

    return { graph, nodes };
  }
}

export const fixture = new GraphFixture();