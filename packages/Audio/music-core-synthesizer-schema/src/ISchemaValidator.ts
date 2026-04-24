export interface ISchemaValidator<TDocument> {
  validate(input: unknown): TDocument;
}
