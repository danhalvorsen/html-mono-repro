import { describe, it, expect } from "vitest"

import { CycleDetector } from "../src/CycleDetector.js";
import { DagGraph } from "../src/DagGraph.js";
  
describe("CycleDetector", () => {

  it("no cycle in empty graph", () => {
    const g = new DagGraph();
    expect(CycleDetector.containsCycle(g)).toBe(false);
  });

  it("no cycle in simple chain", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");
    g.addEdge(a, b);
    expect(CycleDetector.containsCycle(g)).toBe(false);
  });

  it("detects simple cycle (forced)", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");

    // Force manual cycle:
    g.dasInner.edgesInternal.push({ source: b, target: a });
    g.dasInner.edgesInternal.push({ source: a, target: b });

    expect(CycleDetector.containsCycle(g)).toBe(true);
  });

  it("detects deep cycle in chain", () => {
    const g = new DagGraph();
    const n = [...Array(5)].map((_, i) => g.addNode("N" + i));

    g.addEdge(n[0], n[1]);
    g.addEdge(n[1], n[2]);
    g.addEdge(n[2], n[3]);
    g.addEdge(n[3], n[4]);

    // Force cycle:
    g.dasInner.edgesInternal.push({ source: n[4], target: n[0] });

    expect(CycleDetector.containsCycle(g)).toBe(true);
  });

});