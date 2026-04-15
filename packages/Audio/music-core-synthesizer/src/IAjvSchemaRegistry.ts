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
