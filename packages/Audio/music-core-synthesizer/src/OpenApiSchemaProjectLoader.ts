// packages/Audio/music-core-synthesizer/src/OpenApiSchemaProjectLoader.ts

import Ajv2020, {
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";

import type { components } from "./generated/schema-types.js";
import type { IProjectFactory } from "./IProjectFactory.js";
import type { IProjectLoader } from "./IProjectLoader.js";
import { SchemaValidationError } from "./SchemaValidationError.js";

export type SequencerProjectDocumentDto =
  components["schemas"]["SequencerProjectDocument"];

type JsonObject = Record<string, unknown>;
type AjvConstructor = new (options?: {
  allErrors?: boolean;
  strict?: boolean;
}) => {
  addSchema(schema: object, key?: string): void;
  getSchema(
    key: string,
  ): ValidateFunction<SequencerProjectDocumentDto> | undefined;
};
type AddFormatsPlugin = (ajv: object) => void;

export class OpenApiSchemaProjectLoader<TProject>
  implements IProjectLoader<TProject>
{
  private constructor(
    private readonly validateFn: ValidateFunction<SequencerProjectDocumentDto>,
    private readonly projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
  ) {}

  public static create<TProject>(
    openApiYaml: string,
    projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
  ): OpenApiSchemaProjectLoader<TProject> {
    const openApiDocument = YAML.parse(openApiYaml) as JsonObject;
    const Ajv2020Ctor = Ajv2020 as unknown as AjvConstructor;
    const addFormatsPlugin = addFormats as unknown as AddFormatsPlugin;

    const ajv = new Ajv2020Ctor({
      allErrors: true,
      strict: true,
    });

    addFormatsPlugin(ajv);

    const componentSchemas = this.getComponentSchemas(openApiDocument);

    for (const [schemaName, rawSchema] of Object.entries(componentSchemas)) {
      const normalizedSchema = this.normalizeSchema(rawSchema, schemaName);
      ajv.addSchema(normalizedSchema, normalizedSchema.$id as string);
    }

    const validateFn = ajv.getSchema(
      "schema:SequencerProjectDocument",
    ) as ValidateFunction<SequencerProjectDocumentDto> | undefined;

    if (validateFn === undefined) {
      throw new Error("Failed to compile schema: SequencerProjectDocument.");
    }

    return new OpenApiSchemaProjectLoader(validateFn, projectFactory);
  }

  public async load(input: string): Promise<TProject> {
    const parsed = JSON.parse(input) as unknown;

    if (!this.validateFn(parsed)) {
      throw new SchemaValidationError(
        "Project JSON failed schema validation.",
        this.mapErrors(this.validateFn.errors ?? []),
      );
    }

    return this.projectFactory.create(parsed);
  }

  private static getComponentSchemas(openApiDocument: JsonObject): Record<string, JsonObject> {
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

  private static normalizeSchema(schema: JsonObject, schemaName: string): JsonObject {
    const cloned = this.deepClone(schema);
    const rewritten = this.rewriteRefs(cloned);

    if (!this.isObject(rewritten)) {
      throw new Error(`Schema '${schemaName}' did not normalize to an object.`);
    }

    return {
      $id: `schema:${schemaName}`,
      ...rewritten,
    };
  }

  private static rewriteRefs(value: unknown): unknown {
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

  private static rewriteRefValue(ref: string): string {
    const prefix = "#/components/schemas/";

    if (ref.startsWith(prefix)) {
      const schemaName = ref.slice(prefix.length);
      return `schema:${schemaName}`;
    }

    return ref;
  }

  private static deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private static requireObject(source: JsonObject, key: string): JsonObject {
    const value = source[key];

    if (!this.isObject(value)) {
      throw new Error(`Expected '${key}' to be an object.`);
    }

    return value;
  }

  private static isObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private mapErrors(errors: readonly ErrorObject[]): readonly string[] {
    return errors.map(
      (error) => `${error.instancePath || "/"} ${error.message ?? "validation failed"}`,
    );
  }
}
