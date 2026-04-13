import YAML from "yaml";

import type { IOpenApiSchemaParser } from "./IOpenApiSchemaParser.js";

export class YamlOpenApiSchemaParser implements IOpenApiSchemaParser {
  public parse(input: string): Record<string, unknown> {
    return YAML.parse(input) as Record<string, unknown>;
  }
}
