import { Graph } from "@monorepo/core-graph";
import { describe, expect, it } from "vitest";

import { GraphSvgSceneFactory } from "../src/GraphSvgScene.js";
import { GridGraphConstraintEngine } from "../src/GridGraphConstraintEngine.js";

describe("GraphSvgSceneFactory", () => {
  it("should create svg edge coordinates from the graph layout", () => {
    const graph = new Graph();
    const source = graph.addNode("source");
    const target = graph.addNode("target");
    graph.addEdge(source, target);

    const factory = new GraphSvgSceneFactory(new GridGraphConstraintEngine());

    const scene = factory.createScene(graph, {
      width: 300,
      height: 120,
      padding: 20,
      boxWidth: 80,
      boxHeight: 40,
    });

    expect(scene.nodes.map((node) => node.id)).toEqual(["source", "target"]);
    expect(scene.boundary).toEqual({
      topLeft: { x: 0, y: 0 },
      width: 300,
      height: 120,
    });
    expect(scene.edges).toEqual([
      {
        id: "edge-0-source-target",
        start: {
          nodeId: "source",
          connector: { x: 100, y: 40 },
        },
        edge: {
          path: "M 100 40 L 200 40",
        },
        end: {
          nodeId: "target",
          connector: { x: 200, y: 40 },
        },
      },
    ]);
  });

  it("should reject invalid node width values", () => {
    const graph = new Graph();

    const factory = new GraphSvgSceneFactory(new GridGraphConstraintEngine());

    expect(() =>
      factory.createScene(graph, {
        width: 300,
        height: 120,
        padding: 20,
        boxWidth: 0,
        boxHeight: 40,
      }),
    ).toThrowError("Graph box width must be greater than zero.");
  });
});
