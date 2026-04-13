import { describe, expect, it } from "vitest";
import { GraphJsonSerializer } from "../src/GraphJsonSerializer.js";
import { graphFixtures } from "./fixtures/GraphFixtures.js";

describe("GraphJsonSerializer", () => {
  // S-004: Serialize graph to JSON
  it("S-004: Given a graph with nodes A, B and edge A -> B, When serialized, Then JSON contains nodes A, B and edge A -> B", () => {
    const graph = graphFixtures.simpleGraph();
    const serializer = new GraphJsonSerializer();

    const json = serializer.serialize(graph);
    const parsed = JSON.parse(json);

    expect(parsed.nodes).toHaveLength(2);
    expect(parsed.edges).toHaveLength(1);
    expect(parsed.nodes.map((n: { id: string }) => n.id)).toContain("A");
    expect(parsed.nodes.map((n: { id: string }) => n.id)).toContain("B");
    expect(parsed.edges[0].sourceId).toBe("A");
    expect(parsed.edges[0].targetId).toBe("B");
  });

  // S-005: Serialize preserves payload
  it("S-005: Given a graph with node A and payload { x: 1 }, When serialized, Then JSON contains node A with payload { x: 1 }", () => {
    const graph = graphFixtures.graphWithPayload();
    const serializer = new GraphJsonSerializer();

    const json = serializer.serialize(graph);
    const parsed = JSON.parse(json);

    const nodeA = parsed.nodes.find((n: { id: string }) => n.id === "A");
    expect(nodeA.payload).toEqual({ x: 1 });
  });

  // S-014: Serialization does not mutate graph
  it("S-014: Given a graph, When serialized, Then graph structure remains unchanged", () => {
    const graph = graphFixtures.multiNodeGraph();
    const initialNodeCount = graph.nodes.length;
    const initialEdgeCount = graph.edges.length;

    const serializer = new GraphJsonSerializer();
    serializer.serialize(graph);

    expect(graph.nodes).toHaveLength(initialNodeCount);
    expect(graph.edges).toHaveLength(initialEdgeCount);
  });
});
