import { DagGraph, type IDagGraph } from "@monorepo/core-graph";
import { GraphJsonDeserializer } from "@monorepo/core-graph-json";
import domainGraphData from "../data/graphs/domain-graph.json";
import webComponentHierarchyGraphData from "../data/graphs/web-component-hierarchy-graph.json";
import reactiveControllerOwnershipGraphData from "../data/graphs/reactive-controller-ownership-graph.json";
import applicationArchitectureGraphData from "../data/graphs/application-architecture-graph.json";

export interface IApplicationGraphFactory {
  createDomainGraph(): IDagGraph;
  createWebComponentHierarchyGraph(): IDagGraph;
  createReactiveControllerOwnershipGraph(): IDagGraph;
  createApplicationArchitectureGraph(): IDagGraph;
  createGraph(): IDagGraph;
}

export class ApplicationGraphFactory implements IApplicationGraphFactory {
  private readonly deserializer: GraphJsonDeserializer;

  constructor() {
    this.deserializer = new GraphJsonDeserializer(() => new DagGraph());
  }

  createDomainGraph(): IDagGraph {
    return this.deserializer.deserialize(JSON.stringify(domainGraphData)) as IDagGraph;
  }

  createWebComponentHierarchyGraph(): IDagGraph {
    return this.deserializer.deserialize(JSON.stringify(webComponentHierarchyGraphData)) as IDagGraph;
  }

  createReactiveControllerOwnershipGraph(): IDagGraph {
    return this.deserializer.deserialize(JSON.stringify(reactiveControllerOwnershipGraphData)) as IDagGraph;
  }

  createApplicationArchitectureGraph(): IDagGraph {
    return this.deserializer.deserialize(JSON.stringify(applicationArchitectureGraphData)) as IDagGraph;
  }

  createGraph(): IDagGraph {
    return this.createDomainGraph();
  }
}
