import { describe, expect, it } from "vitest";
import { Graph } from "@monorepo/core-graph";
import { GraphJsonSerializer } from "../src/GraphJsonSerializer.js";
import { GraphJsonDeserializer } from "../src/GraphJsonDeserializer.js";
import { graphFixtures } from "./fixtures/GraphFixtures.js";

describe("GraphJsonRoundTrip", () => {
  // S-006: Round-trip consistency
  it("S-006: Given a graph with nodes and edges, When serialized and deserialized, Then resulting graph has same nodes, edges, and payloads", () => {
    const original = graphFixtures.graphWithPayload();
    const serializer = new GraphJsonSerializer();
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    const json = serializer.serialize(original);
    const restored = deserializer.deserialize(json);

    expect(restored.nodes).toHaveLength(original.nodes.length);
    expect(restored.edges).toHaveLength(original.edges.length);

    const originalNodeIds = new Set(original.nodes.map((n) => n.id));
    const restoredNodeIds = new Set(restored.nodes.map((n) => n.id));
    expect(restoredNodeIds).toEqual(originalNodeIds);

    for (const originalNode of original.nodes) {
      const restoredNode = restored.nodes.find((n) => n.id === originalNode.id);
      expect(restoredNode?.payload).toEqual(originalNode.payload);
    }

    for (const originalEdge of original.edges) {
      const exists = restored.edges.some(
        (e) => e.source.id === originalEdge.source.id && e.target.id === originalEdge.target.id,
      );
      expect(exists).toBe(true);
    }
  });

  // S-012: Preserve edge direction
  it("S-012: Given a graph with edge A -> B, When serialized and deserialized, Then resulting graph contains A -> B and not B -> A", () => {
    const original = graphFixtures.singleDirectionGraph();
    const serializer = new GraphJsonSerializer();
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    const json = serializer.serialize(original);
    const restored = deserializer.deserialize(json);

    const hasForwardEdge = restored.edges.some((e) => e.source.id === "A" && e.target.id === "B");
    const hasBackwardEdge = restored.edges.some((e) => e.source.id === "B" && e.target.id === "A");

    expect(hasForwardEdge).toBe(true);
    expect(hasBackwardEdge).toBe(false);
  });
});
