import type { ITagSyntax } from "./ITagSyntax.js";
import type { TagSyntaxParseResult } from "./TagSyntaxParseResult.js";

export interface ITagSyntaxRegistry {
  readonly syntaxes: readonly ITagSyntax[];
  findFirst(text: string): TagSyntaxParseResult | null;
}