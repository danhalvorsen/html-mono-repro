import type { IJsonDocumentParser } from "./IJsonDocumentParser.js";

export class JsonDocumentParser implements IJsonDocumentParser<string> {
  public parse(input: string): unknown {
    return JSON.parse(input) as unknown;
  }
}
