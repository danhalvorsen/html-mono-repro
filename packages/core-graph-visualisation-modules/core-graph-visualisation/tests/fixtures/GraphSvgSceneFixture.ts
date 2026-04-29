import { Graph, type IGraph } from "@monorepo/core-graph";

import {
  GraphSvgSceneFactory,
  type GraphSceneOptions,
  type IGraphSvgSceneFactory,
} from "../../src/GraphSvgScene.js";
import { GridGraphConstraintEngine } from "../../src/GridGraphConstraintEngine.js";

export class GraphSvgSceneFixture {
  createFactory(): IGraphSvgSceneFactory {
    return new GraphSvgSceneFactory(new GridGraphConstraintEngine());
  }

  createSceneOptions(overrides: Partial<GraphSceneOptions> = {}): GraphSceneOptions {
    return {
      width: 300,
      height: 120,
      padding: 20,
      boxWidth: 80,
      boxHeight: 40,
      ...overrides,
    };
  }

  createGraphWithEdge(sourceId: string = "source", targetId: string = "target"): IGraph {
    const graph = new Graph();
    const source = graph.addNode(sourceId);
    const target = graph.addNode(targetId);
    graph.addEdge(source, target);

    return graph;
  }

  createGraphWithNode(nodeId: string, payload?: unknown): IGraph {
    const graph = new Graph();
    graph.addNode(nodeId, payload);

    return graph;
  }

  createEmptyGraph(): IGraph {
    return new Graph();
  }
}