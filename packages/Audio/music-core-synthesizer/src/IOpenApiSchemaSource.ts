export interface IOpenApiSchemaSource {
  read(): Record<string, unknown>;
}
