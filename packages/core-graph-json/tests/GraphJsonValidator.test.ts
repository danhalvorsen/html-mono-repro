import { describe, expect, it } from "vitest";
import { GraphJsonValidator } from "../src/GraphJsonValidator.js";
import { graphJsonDocumentFixtures } from "./fixtures/GraphJsonDocumentFixtures.js";

describe("GraphJsonValidator", () => {
  // S-007: Reject JSON without nodes
  it("S-007: Given a JSON document without nodes array, When validated, Then error is thrown", () => {
    const validator = new GraphJsonValidator();
    const invalid = graphJsonDocumentFixtures.missingNodesArray() as any;

    expect(() => validator.validate(invalid)).toThrow("nodes must be an array");
  });

  // S-008: Reject JSON without edges
  it("S-008: Given a JSON document without edges array, When validated, Then error is thrown", () => {
    const validator = new GraphJsonValidator();
    const invalid = graphJsonDocumentFixtures.missingEdgesArray() as any;

    expect(() => validator.validate(invalid)).toThrow("edges must be an array");
  });

  // S-009: Reject duplicate node ids
  it("S-009: Given a JSON document with duplicate node ids, When validated, Then error is thrown", () => {
    const validator = new GraphJsonValidator();
    const fixture = graphJsonDocumentFixtures.duplicateNodeId();

    expect(() => validator.validate(fixture)).toThrow("Duplicate node id");
  });

  // S-010: Reject edge with missing source
  it("S-010: Given a JSON document with edge X -> A and node X missing, When validated, Then error is thrown", () => {
    const validator = new GraphJsonValidator();
    const fixture = graphJsonDocumentFixtures.edgeWithMissingSource();

    expect(() => validator.validate(fixture)).toThrow("does not exist");
  });

  // S-011: Reject edge with missing target
  it("S-011: Given a JSON document with edge A -> X and node X missing, When validated, Then error is thrown", () => {
    const validator = new GraphJsonValidator();
    const fixture = graphJsonDocumentFixtures.edgeWithMissingTarget();

    expect(() => validator.validate(fixture)).toThrow("does not exist");
  });
});
