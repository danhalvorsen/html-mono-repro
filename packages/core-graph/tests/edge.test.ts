import { describe, it, expect } from "vitest";

import { GraphNode } from "../src/GraphNode.js";
import { Edge } from "../src/Edge.js";
 
describe("Edge", () => {

  it("creates an edge between nodes", () => {
    const a = new GraphNode("A");
    const b = new GraphNode("B");
    const e = new Edge(a, b);

    expect(e.source).toBe(a);
    expect(e.target).toBe(b);
  });

});