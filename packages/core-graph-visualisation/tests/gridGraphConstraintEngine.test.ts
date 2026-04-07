import { Graph } from "@monorepo/core-graph";
import { describe, expect, it } from "vitest";

import { GridGraphConstraintEngine } from "../src/GridGraphConstraintEngine.js";

describe("GridGraphConstraintEngine", () => {
  it("should create deterministic anchor constraints for graph nodes", () => {
    const graph = new Graph();
    graph.addNode("A");
    graph.addNode("B");
    graph.addNode("C");
    graph.addNode("D");

    const engine = new GridGraphConstraintEngine();

    const constraints = engine.createConstraints(
      graph,
      {
        width: 220,
        height: 140,
        padding: 20,
      },
      {
        width: 40,
        height: 20,
      },
    );

    expect(constraints.nodeAnchors).toEqual([
      { id: "A", payload: null, centerX: -70, centerY: 40 },
      { id: "B", payload: null, centerX: 70, centerY: 40 },
      { id: "C", payload: null, centerX: -70, centerY: -40 },
      { id: "D", payload: null, centerX: 70, centerY: -40 },
    ]);
  });

  it("should reject a box that does not fit inside the constrained canvas", () => {
    const graph = new Graph();
    graph.addNode("A");

    const engine = new GridGraphConstraintEngine();

    expect(() =>
      engine.createConstraints(
        graph,
        {
          width: 100,
          height: 100,
          padding: 20,
        },
        {
          width: 70,
          height: 20,
        },
      )).toThrowError("Graph box width must fit inside the canvas content area.");
  });
});
