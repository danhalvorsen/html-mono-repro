// schema.test.ts
import { describe, expect, it } from "vitest";

import {
  AjvSchemaValidator,
  AjvValidationErrorMapper,
  JsonDocumentParser,
  OpenApiSchemaRegistry,
  StringOpenApiSchemaSource,
  YamlOpenApiSchemaParser,
  type IAjvSchema,
  type IAjvSchemaRegistrar,
  type IOpenApiSchemaParser,
  type IValidateFunction,
} from "../src/code.js";
import { SchemaValidationError } from "../src/SchemaValidationError.js";

type TestDocument = {
  readonly project: {
    readonly id: string;
  };
};

class SchemaTestFixture {
  public createJsonParser(): JsonDocumentParser {
    return new JsonDocumentParser();
  }

  public createYamlParser(): YamlOpenApiSchemaParser {
    return new YamlOpenApiSchemaParser();
  }

  public createSchemaRegistry(): OpenApiSchemaRegistry {
    return new OpenApiSchemaRegistry();
  }

  public createErrorMapper(): AjvValidationErrorMapper {
    return new AjvValidationErrorMapper();
  }

  public createSchemaValidator(
    validateFn: IValidateFunction<TestDocument>,
  ): AjvSchemaValidator<TestDocument> {
    return new AjvSchemaValidator<TestDocument>(
      validateFn,
      this.createErrorMapper(),
    );
  }

  public createStringSchemaSource(
    yaml: string,
    parser: IOpenApiSchemaParser,
  ): StringOpenApiSchemaSource {
    return new StringOpenApiSchemaSource(yaml, parser);
  }

  public createValidDocument(): TestDocument {
    return {
      project: {
        id: "project-1",
      },
    };
  }

  public createValidateSuccess(
    document: TestDocument = this.createValidDocument(),
  ): IValidateFunction<TestDocument> {
    const fn = ((input: unknown): input is TestDocument => {
      return input === document;
    }) as IValidateFunction<TestDocument>;

    Object.defineProperty(fn, "errors", {
      value: null,
      enumerable: true,
      configurable: true,
    });

    return fn;
  }

  public createValidateFailure(
    errors: readonly {
      readonly instancePath?: string;
      readonly message?: string;
    }[],
  ): IValidateFunction<TestDocument> {
    const fn = ((_: unknown): _ is TestDocument => {
      return false;
    }) as IValidateFunction<TestDocument>;

    Object.defineProperty(fn, "errors", {
      value: errors,
      enumerable: true,
      configurable: true,
    });

    return fn;
  }

  public createRecordingSchemaRegistrar(): RecordingSchemaRegistrar {
    return new RecordingSchemaRegistrar();
  }

  public createOpenApiDocument(): Record<string, unknown> {
    return {
      openapi: "3.1.0",
      components: {
        schemas: {
          Identifier: {
            type: "string",
            minLength: 1,
          },
          Child: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: {
              id: {
                $ref: "#/components/schemas/Identifier",
              },
            },
          },
          Root: {
            type: "object",
            additionalProperties: false,
            required: ["child"],
            properties: {
              child: {
                $ref: "#/components/schemas/Child",
              },
            },
          },
        },
      },
    };
  }

  public createYamlDocument(): string {
    return [
      "openapi: 3.1.0",
      "components:",
      "  schemas:",
      "    Identifier:",
      "      type: string",
      "      minLength: 1",
      "    Root:",
      "      type: object",
      "      additionalProperties: false",
      "      required:",
      "        - id",
      "      properties:",
      "        id:",
      "          $ref: \"#/components/schemas/Identifier\"",
    ].join("\n");
  }
}

class RecordingSchemaRegistrar implements IAjvSchemaRegistrar {
  private readonly itemsInternal: Array<{
    readonly schema: IAjvSchema;
    readonly key?: string;
  }> = [];

  public get items(): readonly {
    readonly schema: IAjvSchema;
    readonly key?: string;
  }[] {
    return this.itemsInternal;
  }

  public addSchema(schema: IAjvSchema, key?: string): void {
    this.itemsInternal.push({ schema, key });
  }
}

describe("JsonDocumentParser", () => {
  const fixture = new SchemaTestFixture();

  it("should parse valid json into an unknown document", () => {
    const sut = fixture.createJsonParser();

    const result = sut.parse('{"project":{"id":"project-1"}}') as TestDocument;

    expect(result.project.id).toBe("project-1");
  });

  it("should throw when json is invalid", () => {
    const sut = fixture.createJsonParser();

    expect(() => sut.parse("{ invalid json }")).toThrow();
  });
});

describe("YamlOpenApiSchemaParser", () => {
  const fixture = new SchemaTestFixture();

  it("should parse yaml into an openapi document", () => {
    const sut = fixture.createYamlParser();

    const result = sut.parse(fixture.createYamlDocument());

    expect(result).toHaveProperty("components");
    expect(result).toHaveProperty("components.schemas.Root");
    expect(result).toHaveProperty("components.schemas.Identifier");
  });
});

describe("StringOpenApiSchemaSource", () => {
  const fixture = new SchemaTestFixture();

  it("should delegate reading to the provided parser", () => {
    const expected = fixture.createOpenApiDocument();

    const parser: IOpenApiSchemaParser = {
      parse(input: string): Record<string, unknown> {
        expect(input).toBe("yaml-content");
        return expected;
      },
    };

    const sut = fixture.createStringSchemaSource("yaml-content", parser);

    const result = sut.read();

    expect(result).toBe(expected);
  });
});

describe("AjvValidationErrorMapper", () => {
  const fixture = new SchemaTestFixture();

  it("should map ajv errors to readable strings", () => {
    const sut = fixture.createErrorMapper();

    const result = sut.map([
      {
        instancePath: "/project/name",
        message: "must be string",
      },
      {
        instancePath: "",
        message: "must match schema",
      },
    ] as const);

    expect(result).toEqual([
      "/project/name must be string",
      "/ must match schema",
    ]);
  });

  it("should use fallback message when ajv message is missing", () => {
    const sut = fixture.createErrorMapper();

    const result = sut.map([
      {
        instancePath: "/project/id",
      },
    ] as const);

    expect(result).toEqual([
      "/project/id validation failed",
    ]);
  });
});

describe("AjvSchemaValidator", () => {
  const fixture = new SchemaTestFixture();

  it("should return the validated document when validation succeeds", () => {
    const document = fixture.createValidDocument();
    const sut = fixture.createSchemaValidator(
      fixture.createValidateSuccess(document),
    );

    const result = sut.validate(document);

    expect(result).toBe(document);
  });

  it("should throw SchemaValidationError when validation fails", () => {
    const sut = fixture.createSchemaValidator(
      fixture.createValidateFailure([
        {
          instancePath: "/project/id",
          message: "must be string",
        },
      ]),
    );

    const action = (): void => {
      sut.validate({ project: { id: 123 } });
    };

    expect(action).toThrowError(SchemaValidationError);

    try {
      action();
      throw new Error("Expected validation to fail.");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(SchemaValidationError);

      const validationError = error as SchemaValidationError;
      expect(validationError.message).toBe(
        "Project JSON failed schema validation.",
      );
      expect(validationError.validationErrors).toEqual([
        "/project/id must be string",
      ]);
    }
  });

  it("should map an empty ajv error collection when validator exposes no errors", () => {
    const validateFn = ((_: unknown): _ is TestDocument => false) as IValidateFunction<TestDocument>;

    Object.defineProperty(validateFn, "errors", {
      value: undefined,
      enumerable: true,
      configurable: true,
    });

    const sut = fixture.createSchemaValidator(validateFn);

    try {
      sut.validate({ project: { id: "x" } });
      throw new Error("Expected validation to fail.");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(SchemaValidationError);

      const validationError = error as SchemaValidationError;
      expect(validationError.validationErrors).toEqual([]);
    }
  });
});

describe("OpenApiSchemaRegistry", () => {
  const fixture = new SchemaTestFixture();

  it("should register every component schema with a normalized schema id", () => {
    const sut = fixture.createSchemaRegistry();
    const registrar = fixture.createRecordingSchemaRegistrar();

    sut.registerSchemas(registrar, fixture.createOpenApiDocument());

    expect(registrar.items).toHaveLength(3);
    expect(registrar.items.map((item) => item.key)).toEqual([
      "schema:Identifier",
      "schema:Child",
      "schema:Root",
    ]);
  });

  it("should rewrite component refs to local schema ids", () => {
    const sut = fixture.createSchemaRegistry();
    const registrar = fixture.createRecordingSchemaRegistrar();

    sut.registerSchemas(registrar, fixture.createOpenApiDocument());

    const childSchema = registrar.items.find(
      (item) => item.key === "schema:Child",
    )?.schema as Record<string, unknown>;

    const rootSchema = registrar.items.find(
      (item) => item.key === "schema:Root",
    )?.schema as Record<string, unknown>;

    expect(childSchema).toHaveProperty(
      "properties.id.$ref",
      "schema:Identifier",
    );
    expect(rootSchema).toHaveProperty(
      "properties.child.$ref",
      "schema:Child",
    );
  });

  it("should preserve non component refs unchanged", () => {
    const sut = fixture.createSchemaRegistry();
    const registrar = fixture.createRecordingSchemaRegistrar();

    const openApiDocument = {
      components: {
        schemas: {
          Root: {
            type: "object",
            properties: {
              externalRef: {
                $ref: "https://example.com/external-schema.json",
              },
            },
          },
        },
      },
    };

    sut.registerSchemas(registrar, openApiDocument);

    const schema = registrar.items[0]?.schema as Record<string, unknown>;

    expect(schema).toHaveProperty(
      "properties.externalRef.$ref",
      "https://example.com/external-schema.json",
    );
  });

  it("should throw when components is missing", () => {
    const sut = fixture.createSchemaRegistry();
    const registrar = fixture.createRecordingSchemaRegistrar();

    expect(() =>
      sut.registerSchemas(registrar, {}),
    ).toThrowError("Expected 'components' to be an object.");
  });

  it("should throw when schemas contains a non object entry", () => {
    const sut = fixture.createSchemaRegistry();
    const registrar = fixture.createRecordingSchemaRegistrar();

    const invalidDocument = {
      components: {
        schemas: {
          Root: "invalid",
        },
      },
    };

    expect(() =>
      sut.registerSchemas(registrar, invalidDocument),
    ).toThrowError("Schema 'Root' must be an object.");
  });
});
