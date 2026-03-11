// packages/core-graph/tests/edge.test.ts

import { describe, expect, it } from "vitest";
import { Edge } from "../src/index.js";
import { fixture } from "./Fixtures.js";

describe("Edge", () => {
  it("creates an edge between nodes", () => {
    const a = fixture.createNode("A");
    const b = fixture.createNode("B");

    const edge = new Edge(a, b);

    expect(edge.source).toBe(a);
    expect(edge.target).toBe(b);
  });
});