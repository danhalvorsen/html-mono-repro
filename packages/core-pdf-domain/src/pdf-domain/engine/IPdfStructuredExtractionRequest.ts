export interface IPdfStructuredExtractionRequest<TSchemaName extends string = string> {
  readonly schemaName: TSchemaName;
  readonly prompt?: string | undefined;
}
