import type { TagSyntaxParseResult } from "./TagSyntaxParseResult.js";

export interface ITagSyntax<TKey extends string = string> {
  readonly syntaxId: string;
  parse(text: string): TagSyntaxParseResult<TKey>;
}