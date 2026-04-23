// packages/Audio/music-core-synthesizer/src/schema.ts

import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";

import type { IProjectFactory } from "./IProjectFactory.js";
import type { IProjectLoader } from "./IProjectLoader.js";
import { ProjectLoader } from "./ProjectLoader.js";
import { RuleBasedSemanticValidator } from "./RuleBasedSemanticValidator.js";
import { SchemaValidationError } from "./SchemaValidationError.js";
import { SequencerProjectSemanticRuleSet } from "./SequencerProjectSemanticRuleSet.js";

export type SequencerProjectDocumentDto = Record<string, unknown>;

type JsonObject = Record<string, unknown>;

export interface IJsonDocumentParser<TInput = string> {
  parse(input: TInput): unknown;
}

export interface IOpenApiSchemaParser {
  parse(input: string): Record<string, unknown>;
}

export interface IOpenApiSchemaSource {
  read(): Record<string, unknown>;
}

export interface ISchemaValidator<TDocument> {
  validate(input: unknown): TDocument;
}

export interface IValidationErrorMapper<TError> {
  map(errors: readonly TError[]): readonly string[];
}

export interface IAjvSchema {
  readonly $id?: string;
}

export interface IAjvSchemaRegistrar {
  addSchema(schema: IAjvSchema, key?: string): void;
}

export interface IAjvSchemaRegistry {
  registerSchemas(
    schemaRegistrar: IAjvSchemaRegistrar,
    openApiDocument: Record<string, unknown>,
  ): void;
}

export interface IValidateFunction<TDocument> {
  (input: unknown): input is TDocument;
  readonly errors?: readonly ErrorObject[] | null;
}

export interface IAjvFactory {
  create(): IAjvFacade<SequencerProjectDocumentDto>;
}

export interface IAjvFacade<TDocument> extends IAjvSchemaRegistrar {
  getSchema(key: string): IValidateFunction<TDocument> | undefined;
}

export class JsonDocumentParser implements IJsonDocumentParser<string> {
  public parse(input: string): unknown {
    return JSON.parse(input) as unknown;
  }
}

export class YamlOpenApiSchemaParser implements IOpenApiSchemaParser {
  public parse(input: string): Record<string, unknown> {
    return YAML.parse(input) as Record<string, unknown>;
  }
}

export class StringOpenApiSchemaSource implements IOpenApiSchemaSource {
  public constructor(
    private readonly openApiYaml: string,
    private readonly parser: IOpenApiSchemaParser,
  ) {}

  public read(): Record<string, unknown> {
    return this.parser.parse(this.openApiYaml);
  }
}

export class AjvValidationErrorMapper
  implements IValidationErrorMapper<ErrorObject>
{
  public map(errors: readonly ErrorObject[]): readonly string[] {
    return errors.map(
      (error) => `${error.instancePath || "/"} ${error.message ?? "validation failed"}`,
    );
  }
}

export class AjvSchemaValidator<TDocument> implements ISchemaValidator<TDocument> {
  public constructor(
    private readonly validateFn: IValidateFunction<TDocument>,
    private readonly errorMapper: IValidationErrorMapper<ErrorObject>,
  ) {}

  public validate(input: unknown): TDocument {
    if (!this.validateFn(input)) {
      throw new SchemaValidationError(
        "Project JSON failed schema validation.",
        this.errorMapper.map(this.validateFn.errors ?? []),
      );
    }

    return input;
  }
}

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

  private getComponentSchemas(
    openApiDocument: JsonObject,
  ): Record<string, JsonObject> {
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
      $id: this.createSchemaId(schemaName),
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
      return this.createSchemaId(schemaName);
    }

    return ref;
  }

  private createSchemaId(schemaName: string): string {
    return `schema:${schemaName}`;
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

export class Ajv2020Factory implements IAjvFactory {
  public create(): IAjvFacade<SequencerProjectDocumentDto> {
    const Ajv2020Ctor = Ajv2020 as unknown as new (options: {
      allErrors: boolean;
      strict: boolean;
    }) => {
      addSchema(schema: IAjvSchema, key?: string): void;
      getSchema(key: string): ValidateFunction<SequencerProjectDocumentDto> | undefined;
    };

    const addFormatsFn = addFormats as unknown as (instance: unknown) => void;

    const ajv = new Ajv2020Ctor({
      allErrors: true,
      strict: true,
    });

    addFormatsFn(ajv);

    return new AjvFacadeAdapter(ajv);
  }
}

class AjvFacadeAdapter implements IAjvFacade<SequencerProjectDocumentDto> {
  public constructor(
    private readonly ajv: {
      addSchema(schema: IAjvSchema, key?: string): void;
      getSchema(
        key: string,
      ): ValidateFunction<SequencerProjectDocumentDto> | undefined;
    },
  ) {}

  public addSchema(schema: IAjvSchema, key?: string): void {
    this.ajv.addSchema(schema, key);
  }

  public getSchema(
    key: string,
  ): IValidateFunction<SequencerProjectDocumentDto> | undefined {
    const validate = this.ajv.getSchema(key) as
      | ValidateFunction<SequencerProjectDocumentDto>
      | undefined;

    if (validate === undefined) {
      return undefined;
    }

    return validate as unknown as IValidateFunction<SequencerProjectDocumentDto>;
  }
}

export interface ISequencerProjectSchemaLoaderFactory {
  create<TProject>(
    openApiYaml: string,
    projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
  ): IProjectLoader<TProject>;
}

export class SequencerProjectSchemaLoaderFactory
  implements ISequencerProjectSchemaLoaderFactory
{
  public constructor(
    private readonly openApiSchemaParser: IOpenApiSchemaParser = new YamlOpenApiSchemaParser(),
    private readonly schemaRegistry: IAjvSchemaRegistry = new OpenApiSchemaRegistry(),
    private readonly documentParser: IJsonDocumentParser<string> = new JsonDocumentParser(),
    private readonly ajvFactory: IAjvFactory = new Ajv2020Factory(),
    private readonly errorMapper: IValidationErrorMapper<ErrorObject> = new AjvValidationErrorMapper(),
  ) {}

  public create<TProject>(
    openApiYaml: string,
    projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
  ): IProjectLoader<TProject> {
    const openApiDocument = new StringOpenApiSchemaSource(
      openApiYaml,
      this.openApiSchemaParser,
    ).read();

    const ajv = this.ajvFactory.create();

    this.schemaRegistry.registerSchemas(ajv, openApiDocument);

    const validateFn = ajv.getSchema("schema:SequencerProjectDocument");

    if (validateFn === undefined) {
      throw new Error("Failed to compile schema: SequencerProjectDocument.");
    }

    return new ProjectLoader(
      this.documentParser,
      new AjvSchemaValidator(validateFn, this.errorMapper),
      new RuleBasedSemanticValidator(
        new SequencerProjectSemanticRuleSet<SequencerProjectDocumentDto>(),
      ),
      projectFactory,
    );
  }
}

export class OpenApiSchemaProjectLoader<TProject>
  implements IProjectLoader<TProject>
{
  private constructor(
    private readonly inner: IProjectLoader<TProject>,
  ) {}

  public static create<TProject>(
    openApiYaml: string,
    projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
    loaderFactory: ISequencerProjectSchemaLoaderFactory = new SequencerProjectSchemaLoaderFactory(),
  ): OpenApiSchemaProjectLoader<TProject> {
    return new OpenApiSchemaProjectLoader(
      loaderFactory.create(openApiYaml, projectFactory),
    );
  }

  public async load(input: string): Promise<TProject> {
    return await this.inner.load(input);
  }
}
