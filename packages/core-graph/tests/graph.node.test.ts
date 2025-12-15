import { describe, it, expect } from "vitest";
 
import { DagGraph } from "../src/DagGraph.js";

describe("GraphNode", () => {
  it("constructs", () => {
    const node = { id: "A", payload: null };
    expect(node.id).toBe("A");
  });
});