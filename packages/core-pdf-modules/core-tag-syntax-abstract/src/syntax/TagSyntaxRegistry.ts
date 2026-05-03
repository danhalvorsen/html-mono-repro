import type { ITagSyntax } from "./ITagSyntax.js";
import type { ITagSyntaxRegistry } from "./ITagSyntaxRegistry.js";
import type { TagSyntaxParseResult } from "./TagSyntaxParseResult.js";

export class TagSyntaxRegistry implements ITagSyntaxRegistry {
  public readonly syntaxes: readonly ITagSyntax[];

  public constructor(syntaxes: readonly ITagSyntax[]) {
    if (syntaxes.length === 0) {
      throw new Error("syntaxes must contain at least one syntax.");
    }

    this.syntaxes = Object.freeze([...syntaxes]);
  }

  public findFirst(text: string): TagSyntaxParseResult | null {
    for (const syntax of this.syntaxes) {
      const result = syntax.parse(text);

      if (result.matched) {
        return result;
      }
    }

    return null;
  }
}