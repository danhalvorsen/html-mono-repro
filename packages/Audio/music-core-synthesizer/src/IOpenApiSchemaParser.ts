export interface IOpenApiSchemaParser {
  parse(input: string): Record<string, unknown>;
}
