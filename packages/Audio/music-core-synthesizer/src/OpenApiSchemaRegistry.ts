import type {
  IAjvSchema,
  IAjvSchemaRegistrar,
  IAjvSchemaRegistry,
} from "./IAjvSchemaRegistry.js";

type JsonObject = Record<string, unknown>;

export class OpenApiSchemaRegistry implements IAjvSchemaRegistry {
  public registerSchemas(
    schemaRegistrar: IAjvSchemaRegistrar,
    openApiDocument: JsonObject,
  ): void {
    const componentSchemas = this.getComponentSchemas(openApiDocument);

    for (const [schemaName, rawSchema] of Object.entries(componentSchemas)) {
      const normalizedSchema = this.normalizeSchema(rawSchema, schemaName);
      schemaRegistrar.addSchema(normalizedSchema, normalizedSchema.$id);
    }
  }

  private getComponentSchemas(openApiDocument: JsonObject): Record<string, JsonObject> {
    const components = this.requireObject(openApiDocument, "components");
    const schemas = this.requireObject(components, "schemas");
    const result: Record<string, JsonObject> = {};

    for (const [schemaName, schemaValue] of Object.entries(schemas)) {
      if (!this.isObject(schemaValue)) {
        throw new Error(`Schema '${schemaName}' must be an object.`);
      }

      result[schemaName] = schemaValue;
    }

    return result;
  }

  private normalizeSchema(schema: JsonObject, schemaName: string): IAjvSchema {
    const cloned = this.deepClone(schema);
    const rewritten = this.rewriteRefs(cloned);

    return {
      $id: `schema:${schemaName}`,
      ...(rewritten as JsonObject),
    };
  }

  private rewriteRefs(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.rewriteRefs(item));
    }

    if (!this.isObject(value)) {
      return value;
    }

    const result: JsonObject = {};

    for (const [key, childValue] of Object.entries(value)) {
      if (key === "$ref" && typeof childValue === "string") {
        result[key] = this.rewriteRefValue(childValue);
        continue;
      }

      result[key] = this.rewriteRefs(childValue);
    }

    return result;
  }

  private rewriteRefValue(ref: string): string {
    const prefix = "#/components/schemas/";

    if (ref.startsWith(prefix)) {
      const schemaName = ref.slice(prefix.length);
      return `schema:${schemaName}`;
    }

    return ref;
  }

  private deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private requireObject(source: JsonObject, key: string): JsonObject {
    const value = source[key];

    if (!this.isObject(value)) {
      throw new Error(`Expected '${key}' to be an object.`);
    }

    return value;
  }

  private isObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
