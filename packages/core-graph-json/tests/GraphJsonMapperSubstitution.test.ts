import { describe, expect, it } from "vitest";
import { Graph } from "@monorepo/core-graph";
import { GraphJsonDeserializer } from "../src/GraphJsonDeserializer.js";
import { GraphJsonSerializer } from "../src/GraphJsonSerializer.js";
import { GraphJsonMapper } from "../src/GraphJsonMapper.js";
import { graphFixtures } from "./fixtures/GraphFixtures.js";

describe("GraphJsonMapperSubstitution", () => {
  // S-016: Contract compatibility via mapper substitution
  it("S-016: Given a different IGraphDocumentMapper implementation, When substituted, Then serialization and deserialization remain contract-compatible", () => {
    // Custom mapper that logs operations (to verify it's being called)
    const loggedOperations: string[] = [];
    let callCount = 0;

    class LoggingGraphJsonMapper extends GraphJsonMapper {
      toDocument(graph: ReturnType<typeof Graph.prototype>) {
        loggedOperations.push("toDocument");
        callCount++;
        return super.toDocument(graph);
      }

      fromDocument(document: any, graph: any) {
        loggedOperations.push("fromDocument");
        callCount++;
        return super.fromDocument(document, graph);
      }
    }

    const original = graphFixtures.graphWithPayload();
    const loggingMapper = new LoggingGraphJsonMapper();
    const serializer = new GraphJsonSerializer(loggingMapper);
    const deserializer = new GraphJsonDeserializer(() => new Graph(), undefined, loggingMapper);

    const json = serializer.serialize(original);
    expect(loggedOperations).toContain("toDocument");

    const restored = deserializer.deserialize(json);
    expect(loggedOperations).toContain("fromDocument");

    // Verify result is still contract-compatible
    expect(restored.nodes).toHaveLength(original.nodes.length);
    expect(restored.edges).toHaveLength(original.edges.length);

    // Verify logging mapper was actually used (substitution worked)
    expect(callCount).toBe(2);
  });
});
