export interface IJsonDocumentParser<TInput = string> {
  parse(input: TInput): unknown;
}
