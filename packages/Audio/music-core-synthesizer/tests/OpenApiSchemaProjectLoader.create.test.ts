import { describe, expect, it } from "vitest";

import { OpenApiSchemaProjectLoader } from "../src/OpenApiSchemaProjectLoader.js";

describe("OpenApiSchemaProjectLoader.create", () => {
  it("Given schema without SequencerProjectDocument When create Then an error is thrown", () => {
    const schemaYaml = `
openapi: 3.1.0
info:
  title: Test
  version: 1.0.0
paths: {}
components:
  schemas:
    Identifier:
      type: string
`;

    expect(() =>
      OpenApiSchemaProjectLoader.create(schemaYaml, {
        create: (document) => document,
      }),
    ).toThrowError("Failed to compile schema: SequencerProjectDocument.");
  });
});
