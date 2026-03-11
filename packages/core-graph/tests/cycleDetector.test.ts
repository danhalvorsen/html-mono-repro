// packages/core-graph/tests/cycleDetector.test.ts

import { describe, it, expect } from "vitest";
import { CycleDetector } from "../src/Dag/CycleDetector.js";
import { fixture } from "./Fixtures.js";

describe("CycleDetector", () => {

  it("no cycle in empty graph", () => {
    const graph = fixture.createDag();

    expect(CycleDetector.containsCycle(graph)).toBe(false);
  });

  it("no cycle in simple chain", () => {
    const { graph, nodes } = fixture.createDagWithNodes("A", "B");

    graph.addEdge(nodes.A, nodes.B);

    expect(CycleDetector.containsCycle(graph)).toBe(false);
  });

  it("detects simple cycle (forced)", () => {
    const { graph, nodes } = fixture.createDagWithNodes("A", "B");

    // force illegal cycle for detector test
    graph.dasInner.edgesInternal.push({ source: nodes.B, target: nodes.A });
    graph.dasInner.edgesInternal.push({ source: nodes.A, target: nodes.B });

    expect(CycleDetector.containsCycle(graph)).toBe(true);
  });

  it("detects deep cycle in chain", () => {
    const { graph, nodes } = fixture.createDagChain(5);

    // close cycle
    graph.dasInner.edgesInternal.push({ source: nodes[4], target: nodes[0] });

    expect(CycleDetector.containsCycle(graph)).toBe(true);
  });

});