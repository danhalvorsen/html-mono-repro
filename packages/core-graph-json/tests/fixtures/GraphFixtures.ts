import { DagGraph, Graph, type IGraph, type IDagGraph } from "@monorepo/core-graph";

export const graphFixtures = {
  emptyGraph: (): IGraph => new Graph(),
  emptyDagGraph: (): IDagGraph => new DagGraph(),

  simpleGraph: (): IGraph => {
    const graph = new Graph();
    const a = graph.addNode("A");
    const b = graph.addNode("B");
    graph.addEdge(a, b);
    return graph;
  },

  simpleDagGraph: (): IDagGraph => {
    const graph = new DagGraph();
    const a = graph.addNode("A");
    const b = graph.addNode("B");
    graph.addEdge(a, b);
    return graph;
  },

  graphWithPayload: (): IGraph => {
    const graph = new Graph();
    const a = graph.addNode("A", { x: 1 });
    const b = graph.addNode("B", { y: 2 });
    graph.addEdge(a, b);
    return graph;
  },

  multiNodeGraph: (): IGraph => {
    const graph = new Graph();
    const a = graph.addNode("A");
    const b = graph.addNode("B");
    const c = graph.addNode("C");
    graph.addEdge(a, b);
    graph.addEdge(b, c);
    return graph;
  },

  singleDirectionGraph: (): IGraph => {
    const graph = new Graph();
    const a = graph.addNode("A");
    const b = graph.addNode("B");
    graph.addEdge(a, b);
    return graph;
  },
};
