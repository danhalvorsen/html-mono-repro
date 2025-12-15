import { describe, it, expect } from "vitest";

import { Association } from "../src/Association.js";
import { Graph } from "../src/Graph.js";
import { GraphNode } from "../src/GraphNode.js";
import { Edge } from "../src/Edge.js";
import { CycleDetector } from "../src/CycleDetector.js";
import { DagGraph } from "../src/DagGraph.js";

describe("Graph", () => {

  it("adds nodes", () => {
    const g = new Graph();
    const a = g.addNode("A");
    expect(g.nodes.length).toBe(1);
    expect(a.id).toBe("A");
  });

  it("adds nodes with payload", () => {
    const g = new Graph();
    const a = g.addNode("A", { x: 5 });
    expect(a.payload).toEqual({ x: 5 });
  });

  it("adds edges", () => {
    const g = new Graph();
    const a = g.addNode("A");
    const b = g.addNode("B");
    const e = g.addEdge(a, b);

    expect(g.edges.length).toBe(1);
    expect(e.source).toBe(a);
    expect(e.target).toBe(b);
  });

  it("handles multiple nodes & edges", () => {
    const g = new Graph();
    const nodes = ["A", "B", "C"].map(n => g.addNode(n));

    g.addEdge(nodes[0], nodes[1]);
    g.addEdge(nodes[1], nodes[2]);

    expect(g.edges.length).toBe(2);
  });

});
