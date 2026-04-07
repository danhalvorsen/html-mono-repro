import { DagGraph, type IDagGraph } from "@monorepo/core-graph";

export interface IApplicationGraphFactory {
  createGraph(): IDagGraph;
}

export class ApplicationGraphFactory implements IApplicationGraphFactory {
  createGraph(): IDagGraph {
    const graph = new DagGraph();
    const ingest = graph.addNode("Ingest");
    const validate = graph.addNode("Validate");
    const transform = graph.addNode("Transform");
    const enrich = graph.addNode("Enrich");
    const index = graph.addNode("Index");
    const serve = graph.addNode("Serve");

    graph.addEdge(ingest, validate);
    graph.addEdge(validate, transform);
    graph.addEdge(validate, enrich);
    graph.addEdge(transform, index);
    graph.addEdge(enrich, index);
    graph.addEdge(index, serve);

    return graph;
  }
}
