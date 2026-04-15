import type { IOpenApiSchemaParser } from "./IOpenApiSchemaParser.js";
import type { IOpenApiSchemaSource } from "./IOpenApiSchemaSource.js";

export class StringOpenApiSchemaSource implements IOpenApiSchemaSource {
  public constructor(
    private readonly openApiYaml: string,
    private readonly parser: IOpenApiSchemaParser,
  ) {}

  public read(): Record<string, unknown> {
    return this.parser.parse(this.openApiYaml);
  }
}
