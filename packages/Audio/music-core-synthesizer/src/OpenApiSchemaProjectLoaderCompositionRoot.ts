import Ajv2020, {
  type ValidateFunction,
} from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { AjvSchemaValidator } from "./AjvSchemaValidator.js";
import { AjvValidationErrorMapper } from "./AjvValidationErrorMapper.js";
import type { SequencerProjectDocumentDto } from "./dto.js";
import type { IProjectFactory } from "./IProjectFactory.js";
import type { IProjectLoader } from "./IProjectLoader.js";
import { JsonDocumentParser } from "./JsonDocumentParser.js";
import { OpenApiSchemaRegistry } from "./OpenApiSchemaRegistry.js";
import { ProjectLoader } from "./ProjectLoader.js";
import { RuleBasedSemanticValidator } from "./RuleBasedSemanticValidator.js";
import { StringOpenApiSchemaSource } from "./StringOpenApiSchemaSource.js";
import { YamlOpenApiSchemaParser } from "./YamlOpenApiSchemaParser.js";
import { SequencerProjectSemanticRuleSet } from "./rules/SequencerProjectSemanticRuleSet.js";

type AjvConstructor = new (options?: {
  allErrors?: boolean;
  strict?: boolean;
}) => {
  addSchema(schema: object, key?: string): void;
  getSchema(
    key: string,
  ): ValidateFunction<SequencerProjectDocumentDto> | undefined;
};

type AddFormatsPlugin = {
  register(ajv: object): void;
};

class DefaultAddFormatsPlugin implements AddFormatsPlugin {
  public register(ajv: object): void {
    (addFormats as unknown as (value: object) => void)(ajv);
  }
}

export class OpenApiSchemaProjectLoaderCompositionRoot {
  public constructor(
    private readonly ajvCtor: AjvConstructor = Ajv2020 as unknown as AjvConstructor,
    private readonly formatsPlugin: AddFormatsPlugin = new DefaultAddFormatsPlugin(),
  ) {}

  public compose<TProject>(
    openApiYaml: string,
    projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
  ): IProjectLoader<TProject> {
    const openApiDocument = new StringOpenApiSchemaSource(
      openApiYaml,
      new YamlOpenApiSchemaParser(),
    ).read();

    const ajv = new this.ajvCtor({
      allErrors: true,
      strict: true,
    });

    this.formatsPlugin.register(ajv);

    new OpenApiSchemaRegistry().registerSchemas(
      {
        addSchema: (schema, key) => {
          ajv.addSchema(schema, key);
        },
      },
      openApiDocument,
    );

    const validateFn = ajv.getSchema(
      "schema:SequencerProjectDocument",
    ) as ValidateFunction<SequencerProjectDocumentDto> | undefined;

    if (validateFn === undefined) {
      throw new Error("Failed to compile schema: SequencerProjectDocument.");
    }

    return new ProjectLoader(
      new JsonDocumentParser(),
      new AjvSchemaValidator(
        validateFn,
        new AjvValidationErrorMapper(),
      ),
      new RuleBasedSemanticValidator(new SequencerProjectSemanticRuleSet()),
      projectFactory,
    );
  }
}
