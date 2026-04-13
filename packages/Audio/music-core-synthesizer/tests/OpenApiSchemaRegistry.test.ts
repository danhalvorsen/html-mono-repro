import { describe, expect, it } from "vitest";

import { OpenApiSchemaRegistry } from "../src/OpenApiSchemaRegistry.js";

describe("OpenApiSchemaRegistry", () => {
  it("Given component schemas with refs When registerSchemas Then ids are assigned and component refs are rewritten", () => {
    const registry = new OpenApiSchemaRegistry();
    const captured: Array<{ key?: string; schema: object }> = [];

    registry.registerSchemas(
      {
        addSchema: (schema, key) => {
          captured.push({ schema, key });
        },
      },
      {
        components: {
          schemas: {
            Child: {
              type: "object",
              properties: {
                self: {
                  $ref: "#/components/schemas/Child",
                },
                external: {
                  $ref: "#/other/location",
                },
              },
            },
            Parent: {
              type: "object",
              properties: {
                children: [
                  {
                    $ref: "#/components/schemas/Child",
                  },
                ],
              },
            },
          },
        },
      },
    );

    expect(captured).toHaveLength(2);
    expect(captured[0]?.key).toBe("schema:Child");
    expect(captured[1]?.key).toBe("schema:Parent");
    expect(captured[0]?.schema).toMatchObject({
      $id: "schema:Child",
      properties: {
        self: { $ref: "schema:Child" },
        external: { $ref: "#/other/location" },
      },
    });
    expect(captured[1]?.schema).toMatchObject({
      $id: "schema:Parent",
      properties: {
        children: [{ $ref: "schema:Child" }],
      },
    });
  });

  it("Given missing components object When registerSchemas Then an error is thrown", () => {
    const registry = new OpenApiSchemaRegistry();

    expect(() =>
      registry.registerSchemas({ addSchema: () => undefined }, {}),
    ).toThrowError("Expected 'components' to be an object.");
  });

  it("Given non object schema entry When registerSchemas Then an error is thrown", () => {
    const registry = new OpenApiSchemaRegistry();

    expect(() =>
      registry.registerSchemas({ addSchema: () => undefined }, {
        components: {
          schemas: {
            Invalid: "nope",
          },
        },
      }),
    ).toThrowError("Schema 'Invalid' must be an object.");
  });
});
