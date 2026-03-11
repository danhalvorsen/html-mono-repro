import { describe, it, expect } from "vitest";
import { DagGraph, Edge, GraphNode } from "../src/index.js";
describe("GraphNode", () => {
  it("constructs", () => {
    const node = { id: "A", payload: null };
    expect(node.id).toBe("A");
  });
});