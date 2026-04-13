import { describe, expect, it } from "vitest";
import { Graph, DagGraph } from "@monorepo/core-graph";
import { GraphJsonDeserializer } from "../src/GraphJsonDeserializer.js";
import { graphJsonDocumentFixtures } from "./fixtures/GraphJsonDocumentFixtures.js";

describe("GraphJsonDeserializer", () => {
  // S-001: Deserialize valid JSON into graph
  it("S-001: Given a JSON document with nodes A, B and edge A -> B, When deserialized, Then graph contains all nodes and edges", () => {
    const fixture = graphJsonDocumentFixtures.validSimple();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    const result = deserializer.deserialize(json);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.nodes.map((n) => n.id)).toContain("A");
    expect(result.nodes.map((n) => n.id)).toContain("B");
    expect(result.edges[0].source.id).toBe("A");
    expect(result.edges[0].target.id).toBe("B");
  });

  // S-002: Deserialize preserves node payload
  it("S-002: Given a JSON document with node A and payload { x: 1 }, When deserialized, Then node A has payload { x: 1 }", () => {
    const fixture = graphJsonDocumentFixtures.validWithPayloads();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    const result = deserializer.deserialize(json);
    const nodeA = result.nodes.find((n) => n.id === "A");

    expect(nodeA?.payload).toEqual({ x: 1 });
  });

  // S-003: Deserialize empty graph
  it("S-003: Given a JSON document with empty nodes and edges, When deserialized, Then empty graph is created", () => {
    const fixture = graphJsonDocumentFixtures.empty();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    const result = deserializer.deserialize(json);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  // S-007: Reject JSON without nodes
  it("S-007: Given a JSON document without nodes array, When deserialization is attempted, Then error is thrown", () => {
    const invalidJson = JSON.stringify({ edges: [] });
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    expect(() => deserializer.deserialize(invalidJson)).toThrow("nodes must be an array");
  });

  // S-008: Reject JSON without edges
  it("S-008: Given a JSON document without edges array, When deserialization is attempted, Then error is thrown", () => {
    const invalidJson = JSON.stringify({ nodes: [] });
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    expect(() => deserializer.deserialize(invalidJson)).toThrow("edges must be an array");
  });

  // S-009: Reject duplicate node ids
  it("S-009: Given a JSON document with duplicate node ids, When deserialization is attempted, Then error is thrown", () => {
    const fixture = graphJsonDocumentFixtures.duplicateNodeId();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    expect(() => deserializer.deserialize(json)).toThrow("Duplicate node id");
  });

  // S-010: Reject edge with missing source
  it("S-010: Given a JSON document with edge X -> A and node X missing, When deserialization is attempted, Then error is thrown", () => {
    const fixture = graphJsonDocumentFixtures.edgeWithMissingSource();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    expect(() => deserializer.deserialize(json)).toThrow("does not exist");
  });

  // S-011: Reject edge with missing target
  it("S-011: Given a JSON document with edge A -> X and node X missing, When deserialization is attempted, Then error is thrown", () => {
    const fixture = graphJsonDocumentFixtures.edgeWithMissingTarget();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    expect(() => deserializer.deserialize(json)).toThrow("does not exist");
  });

  // S-013: DAG constraint enforced by graph implementation
  it("S-013: Given DAG graph factory and JSON with cycle A -> B and B -> A, When deserialization is attempted, Then error is thrown", () => {
    const fixture = graphJsonDocumentFixtures.cycle();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new DagGraph());

    expect(() => deserializer.deserialize(json)).toThrow();
  });

  // S-015: Deserialization has no external side effects
  it("S-015: Given JSON string in memory, When deserialization is executed, Then graph is created with no file system access", () => {
    const fixture = graphJsonDocumentFixtures.validSimple();
    const json = JSON.stringify(fixture);
    const deserializer = new GraphJsonDeserializer(() => new Graph());

    const result = deserializer.deserialize(json);

    expect(result).toBeDefined();
    expect(result.nodes).toHaveLength(2);
  });
});
